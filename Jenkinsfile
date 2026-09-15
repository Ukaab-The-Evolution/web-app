pipeline {
  agent any

  environment {
    BACKEND = 'backend'
    FRONTEND = 'frontend'
  }

  stages {
    stage('Install') {
      parallel {
        stage('Backend') {
          agent { docker { image 'node:20-alpine' } }
          steps { dir("${BACKEND}") { sh 'npm ci' } }
        }
        stage('Frontend') {
          agent { docker { image 'node:20-alpine' } }
          steps { dir("${FRONTEND}") { sh 'npm ci' } }
        }
      }
    }

    stage('Test') {
      parallel {
        stage('Backend') {
          agent { docker { image 'node:20-alpine' } }
          steps { dir("${BACKEND}") { sh 'npm test -- --runInBand' } }
        }
        stage('Frontend') {
          agent { docker { image 'node:20-alpine' } }
          steps {
            dir("${FRONTEND}") {
              sh 'CI=true npm test -- --watchAll=false --runInBand'
              sh 'npm run lint'
            }
          }
        }
      }
    }

    stage('Dependency audit') {
      parallel {
        stage('Backend audit') {
          agent { docker { image 'node:20-alpine' } }
          steps { dir("${BACKEND}") { sh 'npm audit --omit=dev --audit-level=high' } }
        }
        stage('Frontend audit') {
          agent { docker { image 'node:20-alpine' } }
          steps { dir("${FRONTEND}") { sh 'npm audit --omit=dev --audit-level=high' } }
        }
      }
    }

    stage('Build Frontend') {
      agent { docker { image 'node:20-alpine' } }
      steps { dir("${FRONTEND}") { sh 'CI=true npm run build' } }
    }

    stage('Docker Build') {
      steps {
        sh 'docker build --target production -t ukaab-frontend:ci frontend'
        sh 'docker build -t ukaab-backend:ci backend'
      }
    }
  }

  post { always { cleanWs() } }
}
