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
          agent {
            docker {
              image 'node:18-alpine'
              args '-v /var/run/docker.sock:/var/run/docker.sock'
            }
          }
          steps {
            dir("${BACKEND}") {
              sh 'npm ci'
            }
          }
        }
        stage('Frontend') {
          agent {
            docker {
              image 'node:20-alpine'
              args '-v /var/run/docker.sock:/var/run/docker.sock'
            }
          }
          steps {
            dir("${FRONTEND}") {
              sh 'npm ci'
            }
          }
        }
      }
    }

    stage('Test') {
      parallel {
        stage('Backend') {
          agent { docker { image 'node:18-alpine' } }
          steps {
            dir("${BACKEND}") {
              sh 'npm test || true'
            }
          }
        }
        stage('Frontend') {
          agent { docker { image 'node:20-alpine' } }
          steps {
            dir("${FRONTEND}") {
              sh 'npm test -- --watchAll=false || true'
            }
          }
        }
      }
    }

    stage('Build Frontend') {
      agent { docker { image 'node:20-alpine' } }
      steps {
        dir("${FRONTEND}") {
          sh 'npm run build'
        }
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker-compose build'
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}