import supabase from '../config/supabase.js';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../config/supabase.js'; 
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import crypto from 'crypto';

// Upload document for verification
export const uploadDocument = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('File required', 400));
  if (!req.body.document_type) return next(new AppError('Document type required', 400));
  
  // Verify user is authenticated
  if (!req.user?.user_id) {
    return next(new AppError('Authentication required', 401));
  }

  try {
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${crypto.randomBytes(16).toString('hex')}.${fileExt}`;
    const storagePath = `users/${req.user.user_id}/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
        cacheControl: '3600'
      });

    if (uploadError) throw uploadError;

    // Create document record
    const { data: docData, error: dbError } = await supabaseAdmin
      .from('documents')
      .insert({
        user_id: req.user.user_id,
        auth_user_id: req.user.auth_user_id,
        document_type: req.body.document_type,
        storage_path: storagePath,
        status: 'pending',
        uploaded_at: new Date().toISOString()
      })
      .select();

    if (dbError) {
      await supabaseAdmin.storage.from('documents').remove([storagePath]);
      throw dbError;
    }

    res.status(201).json({
      status: 'success',
      data: { document: docData[0] }
    });

  } catch (err) {
    console.error('Upload error:', err);
    next(new AppError(`Upload failed: ${err.message}`, 400));
  }
});

// Admin review documents - Updated to use storage_path
// Get all pending documents (for admin)
export const getPendingDocuments = catchAsync(async (req, res, next) => {
  try {
    const { data: documents, error } = await supabaseAdmin
      .from('documents')
      .select(`
        document_id,
        user_id,
        document_type,
        storage_path,
        uploaded_at,
        status,
        users:user_id (
          user_id,
          full_name,
          user_type
        )
      `)
      .eq('status', 'pending')
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: { documents }
    });
  } catch (err) {
    console.error('Error fetching pending documents:', err);
    next(new AppError('Failed to fetch pending documents', 500));
  }
});

// Review document (approve/reject)
export const reviewVerification = catchAsync(async (req, res, next) => {
  const { document_id, action } = req.body;
  
  // Validate input
  if (!document_id || !action) {
    return next(new AppError('Document ID and action are required', 400));
  }
  
  if (!['approve', 'reject'].includes(action)) {
    return next(new AppError('Action must be either "approve" or "reject"', 400));
  }

  try {
    // 1. Get the document
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('user_id, storage_path')
      .eq('document_id', document_id)
      .single();

    if (docError) throw docError;

    // 2. Update document status
    const { error: updateError } = await supabaseAdmin
      .from('documents')
      .update({ 
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: req.user.user_id,
        reviewed_at: new Date().toISOString()
      })
      .eq('document_id', document_id);

    if (updateError) throw updateError;

    // 3. If rejected, delete the file
    if (action === 'reject') {
      await supabaseAdmin.storage
        .from('documents')
        .remove([document.storage_path]);
    }

    // 4. User verification is now handled by Supabase Auth
    // No need to update verification status in our database

    res.status(200).json({
      status: 'success',
      message: `Document ${action}d successfully`
    });

  } catch (err) {
    console.error('Document review error:', err);
    next(new AppError('Failed to process document review', 500));
  }
});
