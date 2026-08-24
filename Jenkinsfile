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
          steps { dir("${FRONTEND}") { sh 'CI=true npm test -- --watchAll=false --runInBand' } }
        }
      }
    }

    stage('Build Frontend') {
      agent { docker { image 'node:20-alpine' } }
      steps { dir("${FRONTEND}") { sh 'CI=true npm run build' } }
    }

    stage('Docker Build') {
      steps { sh 'docker compose build' }
    }
  }

  post { always { cleanWs() } }
}
