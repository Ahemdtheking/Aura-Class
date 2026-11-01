(() => {
  const version = '12.19.0';
  const config = window.AURA_FIREBASE_CONFIG || {};
  const authKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const isConfigured = authKeys.every(key => config[key] && typeof config[key] === 'string' && !config[key].includes('YOUR_'));
  const databaseConfigured = !!(config.databaseURL && !config.databaseURL.includes('YOUR_'));
  let auth = null;
  let authSdk = null;
  let firebaseApp = null;
  let databaseSdk = null;
  let database = null;
  let analytics = null;
  let initPromise = null;

  async function initialize() {
    if (!isConfigured) throw new Error('Add the Firebase Web App settings in firebase-config.js to enable sign-in.');
    if (initPromise) return initPromise;
    initPromise = (async () => {
      const appSdk = await import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`);
      authSdk = await import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`);
      firebaseApp = appSdk.initializeApp(config);
      auth = authSdk.getAuth(firebaseApp);
      if (databaseConfigured) {
        databaseSdk = await import(`https://www.gstatic.com/firebasejs/${version}/firebase-database.js`);
        database = databaseSdk.getDatabase(firebaseApp, config.databaseURL);
      }
      if (config.measurementId) {
        try {
          const analyticsSdk = await import(`https://www.gstatic.com/firebasejs/${version}/firebase-analytics.js`);
          if (await analyticsSdk.isSupported()) analytics = analyticsSdk.getAnalytics(firebaseApp);
        } catch { /* Analytics is optional in browsers that block measurement APIs. */ }
      }
      authSdk.onAuthStateChanged(auth, user => window.dispatchEvent(new CustomEvent('aura-auth-state', { detail: { user } })));
      window.auraFirebaseApp = firebaseApp;
      return auth;
    })();
    return initPromise;
  }

  function requireDatabase() {
    if (!databaseConfigured) throw new Error('Realtime Database is not configured in firebase-config.js.');
    if (!databaseSdk || !database) throw new Error('Firebase Realtime Database SDK is not ready. Reload the app and check the browser connection.');
  }

  async function getClass(classId) {
    await initialize();
    requireDatabase();
    const id = String(classId || '').trim().toUpperCase();
    if (!/^CL-[A-Z0-9]+$/.test(id)) throw new Error('Enter a valid Class ID.');
    const snapshot = await databaseSdk.get(databaseSdk.ref(database, `classes/${id}`));
    return snapshot.exists() ? snapshot.val() : null;
  }

  function memberRecord(user, profile) {
    return {
      uid: user.uid,
      studentId: profile.id,
      name: profile.name || user.displayName || 'Student',
      joinedAt: new Date().toISOString()
    };
  }

  function publicProfile(profile) {
    if (!profile?.uid || !profile?.id || !['Student', 'Teacher'].includes(profile.role)) {
      throw new Error('Complete your Aura Class profile before syncing it.');
    }
    return {
      uid: profile.uid,
      id: profile.id,
      name: profile.name || 'Aura Class user',
      role: profile.role,
      photoURL: profile.photoURL || ''
    };
  }

  window.auraClassCloud = {
    configured: databaseConfigured,
    async publishProfile(profile) {
      const service = await initialize();
      requireDatabase();
      const user = service.currentUser;
      const record = publicProfile(profile);
      if (!user || user.uid !== record.uid) throw new Error('Sign in again before syncing your profile.');
      await databaseSdk.set(databaseSdk.ref(database, `profilesById/${record.role}/${record.id}`), record);
      return record;
    },
    async findStudent(studentId) {
      await initialize();
      requireDatabase();
      const id = String(studentId || '').trim().toUpperCase();
      if (!/^AC-[A-Z0-9]+$/.test(id)) throw new Error('Enter a valid Student ID.');
      const snapshot = await databaseSdk.get(databaseSdk.ref(database, `profilesById/Student/${id}`));
      return snapshot.exists() ? snapshot.val() : null;
    },
    async addStudentToRoster(profile) {
      const service = await initialize();
      requireDatabase();
      const teacher = service.currentUser;
      const student = publicProfile(profile);
      if (!teacher) throw new Error('Sign in as a teacher before editing your Student list.');
      if (student.role !== 'Student') throw new Error('Only a Student ID can be added to a Student list.');
      const verified = await this.findStudent(student.id);
      if (!verified || verified.uid !== student.uid) throw new Error('That Student ID is not registered to this account yet. Ask the student to sign in once, then try again.');
      const record = { uid: student.uid, studentId: student.id, name: student.name, addedAt: new Date().toISOString() };
      await databaseSdk.set(databaseSdk.ref(database, `teacherRosters/${teacher.uid}/${student.uid}`), record);
      return record;
    },
    async listTeacherRoster(uid) {
      const service = await initialize();
      requireDatabase();
      if (!service.currentUser || service.currentUser.uid !== uid) throw new Error('Only the signed-in teacher can load their Student list.');
      const snapshot = await databaseSdk.get(databaseSdk.ref(database, `teacherRosters/${uid}`));
      return snapshot.exists() ? Object.values(snapshot.val()) : [];
    },
    async addStudentToClass(classId, profile) {
      const service = await initialize();
      requireDatabase();
      const teacher = service.currentUser;
      const student = publicProfile(profile);
      if (!teacher) throw new Error('Sign in as a teacher before assigning a student.');
      if (student.role !== 'Student') throw new Error('Only a Student account can join a class.');
      const record = await getClass(classId);
      if (!record) throw new Error(`Class ${classId} is not published online yet. Create or republish the class, then try again.`);
      if (record.ownerUid !== teacher.uid) throw new Error('You can only add students to classes you created.');
      await databaseSdk.set(
        databaseSdk.ref(database, `classMembers/${record.classId}/${student.uid}`),
        memberRecord({ uid: student.uid, displayName: student.name }, student)
      );
      return record;
    },
    async publishClass(course, selectedProfiles = []) {
      const service = await initialize();
      requireDatabase();
      const user = service.currentUser;
      if (!user) throw new Error('Sign in again before publishing this class online.');
      const id = String(course.id || '').toUpperCase();
      if (!/^CL-[A-Z0-9]+$/.test(id)) throw new Error('The class has an invalid ID.');
      const record = {
        classId: id,
        ownerUid: user.uid,
        teacherId: course.teacherId,
        teacherName: user.displayName || course.subtitle || 'Teacher',
        title: course.title,
        subtitle: course.subtitle,
        topic: course.topic || '',
        next: course.next || '',
        duration: course.duration || '',
        createdAt: course.createdAt || new Date().toISOString()
      };
      const updates = {};
      updates[`classes/${id}`] = record;
      updates[`teacherClasses/${user.uid}/${id}`] = record;
      await databaseSdk.update(databaseSdk.ref(database), updates);
      const eligible = selectedProfiles.filter(profile => profile?.uid && profile?.id && !profile.profilePending);
      await Promise.all(eligible.flatMap(profile => {
        const student = publicProfile({ ...profile, role: 'Student' });
        const member = memberRecord({ uid: student.uid, displayName: student.name }, student);
        const roster = { uid: student.uid, studentId: student.id, name: student.name, addedAt: new Date().toISOString() };
        return [
          databaseSdk.set(databaseSdk.ref(database, `classMembers/${id}/${student.uid}`), member),
          databaseSdk.set(databaseSdk.ref(database, `teacherRosters/${user.uid}/${student.uid}`), roster)
        ];
      }));
      return record;
    },
    async findClass(classId) {
      return getClass(classId);
    },
    async joinClass(classId, profile) {
      const service = await initialize();
      requireDatabase();
      const user = service.currentUser;
      if (!user) throw new Error('Sign in with Google or Facebook before joining a class.');
      const record = await getClass(classId);
      if (!record) return null;
      if (!profile?.id || profile.role !== 'Student') throw new Error('Choose a Student account before joining.');
      await databaseSdk.set(
        databaseSdk.ref(database, `classMembers/${record.classId}/${user.uid}`),
        memberRecord(user, profile)
      );
      return record;
    },
    async listTeacherClasses(uid) {
      const service = await initialize();
      requireDatabase();
      if (!service.currentUser || service.currentUser.uid !== uid) throw new Error('Only the signed-in teacher can load their classes.');
      const snapshot = await databaseSdk.get(databaseSdk.ref(database, `teacherClasses/${uid}`));
      return snapshot.exists() ? Object.values(snapshot.val()) : [];
    },
    async listClassMembers(classId) {
      const service = await initialize();
      requireDatabase();
      if (!service.currentUser) throw new Error('Sign in before loading class members.');
      const id = String(classId || '').trim().toUpperCase();
      const snapshot = await databaseSdk.get(databaseSdk.ref(database, `classMembers/${id}`));
      return snapshot.exists() ? Object.values(snapshot.val()) : [];
    }
  };

  window.auraAuthConfigured = isConfigured;
  window.auraRealtimeConfigured = databaseConfigured;

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

  if (isConfigured) initialize().catch(error => window.dispatchEvent(new CustomEvent('aura-auth-error', { detail: { message: error.message || 'Firebase could not start.' } })));
})();
