# Aura Class

A responsive web classroom for separate Student and Teacher accounts, inspired by the supplied home-page reference.

## Run the app

1. Extract the project folder.
2. Start a local web server inside it:

   ```powershell
   py -m http.server 8000
   ```

3. Open `http://localhost:8000`.
4. Sign in with Google or Facebook. On first sign-in, select Student or Teacher. Firebase Authentication providers must be enabled, and `localhost` must be listed under Authentication → Settings → Authorized domains.

Camera and microphone access requires `localhost` or HTTPS. A direct `file://` open will not support sign-in or WebRTC correctly.

## Firebase setup

`firebase-config.js` contains the Firebase Web App config. The Realtime Database endpoint is left blank because the Console page URL is not the database endpoint. In Firebase Console → Realtime Database → Data, copy the database URL displayed above the JSON tree and set it as `databaseURL` in `firebase-config.js`.

The endpoint typically looks like `https://<database-name>.firebaseio.com` for `us-central1` or `https://<database-name>.<region>.firebasedatabase.app` for other regions. Follow Firebase’s [Realtime Database Web setup guide](https://firebase.google.com/docs/database/web/start) and configure authenticated security rules before enabling shared data. Do not use a database secret in browser code.

Google and Facebook sign-in use Firebase Authentication. Facebook additionally requires an app ID and secret configured in Firebase; never put the Facebook secret in this project.

## Features currently in this project

- Student and Teacher sign-in roles with separate `AC-…` and `TC-…` IDs.
- Profile details, teacher student list, ID-based roster entry, and course assignment.
- Teacher-created classes with shareable Class IDs. Teachers can select students from their Student list when creating a class; listed or unlisted students can join with the ID.
- Class routines, assignments, MCQ/descriptive exams, and grading.
- Student materials, bookmarks, submissions, exam results, announcements, and discussions.
- Browser class reminders while the app is open.
- WebRTC audio/video, peer chat, reactions, screen sharing, and a data-channel whiteboard.
- Local WebM recording download, resource playback speed controls, and resource downloads.

## Current storage and call limits

Class records, roster changes, resource files, submissions, and results are saved in this browser’s `localStorage`; they do not synchronize between different accounts or devices yet. Class IDs can be used to join classes whose data is present in the same browser. Joining from a different device, syncing class lists, and verifying another device’s Student ID require a Realtime Database endpoint, secure rules, and a connected data layer. An ID that is not in this browser appears as a pending profile.

Live media uses WebRTC peer-to-peer. To connect, the teacher starts a live room and shares the generated offer; the student pastes it, returns an answer, and the teacher applies that answer. Both browsers must remain open during setup. A public STUN server is configured; some networks require a TURN relay. Push notifications while the app is closed, cloud recordings, and cloud file storage need additional Firebase services and deployment configuration.