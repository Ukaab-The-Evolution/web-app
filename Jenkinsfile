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
    }

    post {
        always {
            cleanWs()
        }
    }
}
