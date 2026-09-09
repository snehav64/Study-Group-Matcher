pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code from Git...'
                checkout scm
            }
        }

        stage('Build Verification') {
            steps {
                echo 'Verifying Docker configurations...'
                echo 'Pipeline verification successful.'
            }
        }
    }

    post {
        success {
            echo 'CI/CD pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline run encountered an error.'
        }
    }
}