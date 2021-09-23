import React from 'react';
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Auth from '@aws-amplify/auth';
import CssBaseline from '@material-ui/core/CssBaseline';

Auth.configure({
  region: process.env.NEXT_PUBLIC_COGNITO_REGION, 
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USERPOOL_ID,
  userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_USERPOOL_CLIENT_ID,
  oauth: {
    domain: process.env.NEXT_PUBLIC_COGNITO_OAUTH_DOMAIN,
    scope: process.env.NEXT_PUBLIC_COGNITO_OAUTH_SCOPE.split(","),
    redirectSignIn: process.env.NEXT_PUBLIC_COGNITO_OAUTH_REDIRECT_SIGNIN,
    redirectSignOut: process.env.NEXT_PUBLIC_COGNITO_OAUTH_REDIRECT_SIGNOUT,
    responseType: process.env.NEXT_PUBLIC_COGNITO_OAUTH_RESPONSE_TYPE
  },
});

function App({ Component, pageProps }: AppProps) {
  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <>
      <Head>
        <title>simple community</title>
      </Head>
      <CssBaseline />
      <Component {...pageProps} />
    </>
  )
}
export default App
