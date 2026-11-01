(() => {
  const version = '12.19.0';
  let auth = null;
  let authSdk = null;
  let firebaseApp = null;
  let analytics = null;
  let initPromise = null;
  const config = window.AURA_FIREBASE_CONFIG || {};
  const authKeys=['apiKey','authDomain','projectId','appId'];
  const isConfigured = authKeys.every(key=>config[key]&&typeof config[key]==='string'&&!config[key].includes('YOUR_'));

  async function initialize() {
    if (!isConfigured) throw new Error('Add the Firebase Web App settings in firebase-config.js to enable Google and Facebook sign-in.');
    if (initPromise) return initPromise;
    initPromise = (async () => {
      const appSdk = await import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`);
      authSdk = await import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`);
      firebaseApp = appSdk.initializeApp(config);
      auth = authSdk.getAuth(firebaseApp);
      if(config.measurementId){
        try{
          const analyticsSdk=await import(`https://www.gstatic.com/firebasejs/${version}/firebase-analytics.js`);
          if(await analyticsSdk.isSupported())analytics=analyticsSdk.getAnalytics(firebaseApp);
        }catch{/* Analytics is optional in browsers that block measurement APIs. */}
      }
      authSdk.onAuthStateChanged(auth, user => window.dispatchEvent(new CustomEvent('aura-auth-state', { detail: { user } })));
      window.auraFirebaseApp=firebaseApp;
      return auth;
    })();
    return initPromise;
  }

  window.addEventListener('aura-auth-request', async event => {
    try {
      const service = await initialize();
      const provider = event.detail?.provider;
      const authProvider = provider === 'facebook' ? new authSdk.FacebookAuthProvider() : new authSdk.GoogleAuthProvider();
      if (provider === 'facebook') authProvider.addScope('email');
      await authSdk.signInWithPopup(service, authProvider);
    } catch (error) {
      window.dispatchEvent(new CustomEvent('aura-auth-error', { detail: { message: error.message || 'Sign-in failed.' } }));
    }
  });

  window.addEventListener('aura-signout-request', async () => {
    try { if (auth && authSdk) await authSdk.signOut(auth); }
    catch (error) { window.dispatchEvent(new CustomEvent('aura-auth-error', { detail: { message: error.message || 'Sign-out failed.' } })); }
  });

  window.auraAuthConfigured = !!isConfigured;
  window.auraRealtimeConfigured = !!(config.databaseURL && !config.databaseURL.includes('YOUR_'));
  if (isConfigured) initialize().catch(error => window.dispatchEvent(new CustomEvent('aura-auth-error', { detail: { message: error.message || 'Firebase could not start.' } })));
})();
