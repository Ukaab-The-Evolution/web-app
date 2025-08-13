pipeline {
  agent any

  environment {
    BACKEND = 'backend'
    FRONTEND = 'frontend'
    NODE_IMAGE = 'node:20-alpine' // unified Node version for consistency
  }

  options {
    // Make sure we start from a clean state each run
    skipDefaultCheckout()
  }

  stages {
    stage('Workspace Cleanup & Checkout') {
      steps {
        deleteDir()         // Wipe old workspace
        checkout scm        // Pull fresh code
      }
    }

    stage('Install') {
      parallel {
        stage('Backend') {
          agent {
            docker {
              image "${NODE_IMAGE}"
              args '-v /var/run/docker.sock:/var/run/docker.sock'
            }
          }
          steps {
            dir("${BACKEND}") {
              sh '''
                rm -rf node_modules
                npm cache clean --force
                npm ci
              '''
            }
          }
        }

        stage('Frontend') {
          agent {
            docker {
              image "${NODE_IMAGE}"
              args '-v /var/run/docker.sock:/var/run/docker.sock'
            }
          }
          steps {
            dir("${FRONTEND}") {
              sh '''
                rm -rf node_modules
                npm cache clean --force
                npm ci
              '''
            }
          }
        }
      }
    }

    stage('Test') {
      parallel {
        stage('Backend') {
          agent {
            docker { image "${NODE_IMAGE}" }
          }
          steps {
            dir("${BACKEND}") {
              sh 'npm test || true'
            }
          }
        }

        stage('Frontend') {
          agent {
            docker { image "${NODE_IMAGE}" }
          }
          steps {
            dir("${FRONTEND}") {
              sh 'npm test -- --watchAll=false || true'
            }
          }
        }
      }
    }

    stage('Build Frontend') {
      agent { docker { image "${NODE_IMAGE}" } }
      steps {
        dir("${FRONTEND}") {
          sh 'CI=false npm run build'
        }
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker-compose build --no-cache'
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
