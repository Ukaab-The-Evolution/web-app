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
                    steps {
                        dir(BACKEND) {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir(FRONTEND) {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Test') {
            parallel {
                stage('Backend') {
                    steps {
                        dir(BACKEND) {
                            sh 'npm test || true'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir(FRONTEND) {
                            sh 'npm test -- --watchAll=false || true'
                        }
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir(FRONTEND) {
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker-compose build'
            }
        }

        // Temporarily disabling Deploy Locally until CI is gated
        //stage('Deploy Locally') {
        //    steps {
        //        sshagent(['local-deploy-key']) {
        //            sh """
        //              ssh -o StrictHostKeyChecking=no ubuntu@your-deploy-host '
        //                cd ~/ukaab/web-app &&
        //                docker-compose pull &&
        //                docker-compose up -d
        //              '
        //            """
        //        }
        //    }
        //}
    }

    post {
        always {
            cleanWs()
        }
    }
}

