# Aura Class

A responsive, browser-based online classroom interface inspired by the supplied home-page reference.

## Open locally

Serve this folder from localhost so browsers can grant camera and microphone access:

```powershell
cd "C:\Users\Tafazzul Ahmed Mahim\Documents\Codex\2026-11-01\go\outputs"
py -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000). Camera and microphone permissions are requested when you join or create a class.

## Google and Facebook accounts

Sign-in uses the supplied Firebase project config in `firebase-config.js`. The Web SDK initializes Firebase Authentication and Analytics. Enable Google and Facebook in Authentication > Sign-in method and add the app host to Authorized domains. Facebook also needs its Facebook Login app credentials configured in Firebase. See Firebase’s setup guides for [Google](https://firebase.google.com/docs/auth/web/google-signin) and [Facebook](https://firebase.google.com/docs/auth/web/facebook-login). After a first successful sign-in, the user chooses **Student** or **Teacher**; Aura Class then shows a separate `AC-…` Student ID or `TC-…` Teacher ID.

The **Student preview** and **Teacher preview** buttons are local demo accounts. Their sample roster and schedules are saved in this browser. Real accounts can sign in once Firebase is configured.

## WebRTC classroom

The live room uses browser `getUserMedia`, `RTCPeerConnection`, and `RTCDataChannel` for audio/video, peer chat, screen sharing, and reactions. To connect two browsers without a signaling service:

1. The host starts a class, selects the people icon, and copies the WebRTC offer.
2. The guest selects **Join a class**, pastes the offer, and copies the generated answer.
3. The host chooses **I have an answer**, pastes the guest answer, and connects.

The sample config uses a public STUN server. Some networks need a TURN relay for peer-to-peer media to connect.

## Prototype data

The student view only lists classes, routines, and exams assigned to its Student ID. Teachers can create classes, add student IDs to their roster, publish routines, and assign exams. In this browser preview, roster, course, routine, and exam changes are stored in `localStorage`; connecting different users across devices needs a Realtime Database URL and access rules. The Firebase snippet did not include a database URL.

The live classroom uses browser WebRTC. When there is no signaling service configured, participants exchange the WebRTC offer and answer manually using the **Connect a participant** and **Join a class** flows. Audio/video runs peer-to-peer; the sample setup uses a public STUN server. The record control saves a local WebM file. Cloud recording, persistent video/resources, and push notifications require additional backend services.
