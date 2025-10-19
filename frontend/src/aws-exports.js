// AWS Amplify Configuration
const awsconfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_0SwHLEPYW',
      userPoolClientId: '1tc1jakrtv1m8184qp031k6kb7',
      loginWith: {
        email: true,
        username: true,
        phone: false,
      }
    }
  }
}

export default awsconfig
