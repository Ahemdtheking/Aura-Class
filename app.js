const icon = (name, extra = '') => `<svg class="icon ${extra}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const $ = (selector, root = document) => root.querySelector(selector);
const app = $('#app');
const modalRoot = $('#modal-root');
const toastRoot = $('#toast-root');

const studentNavGroups = [
  { label: 'Learn', items: [
    ['home', 'Home', 'home'], ['classes', 'My classes', 'grid'], ['recordings', 'Recordings', 'play'],
    ['materials', 'Notes & PDFs', 'book'], ['bookmarks', 'Bookmarks', 'bookmark'],
  ] },
  { label: 'Stay on track', items: [
    ['assignments', 'Assignments', 'clipboard', '3'], ['exams', 'Exams & quizzes', 'check'],
    ['schedule', 'Schedule', 'calendar'], ['community', 'Community', 'chat'],
  ] },
];
const teacherNavGroups = [
  { label: 'Teach', items: [['home','Teaching dashboard','home'],['classes','My classes','grid'],['student-list','Student list','users'],['recordings','Recordings','play'],['materials','Notes & PDFs','book']] },
  { label: 'Classwork', items: [['assignments','Assignments','clipboard'],['exams','Exams & quizzes','check'],['schedule','Schedule & routine','calendar'],['community','Community','chat']] },
];

const courses = [
  { id:'math4', teacherId:'TC-1001', studentIds:['AC-2048','AC-2049'], title: 'Advanced Mathematics', subtitle: 'Mr. Rahman · Chapter 4: Calculus', progress: 72, code: 'M', color: 'math', next: 'Today · 10:30 AM', duration: '60 min' },
  { id:'phys7', teacherId:'TC-1002', studentIds:['AC-2048'], title: 'Physics — Mechanics', subtitle: 'Ms. Tasnim · Chapter 7: Momentum', progress: 48, code: 'P', color: 'physics', next: 'Today · 1:00 PM', duration: '50 min' },
  { id:'eng1', teacherId:'TC-1003', studentIds:['AC-2048'], title: 'English Literature', subtitle: 'Mr. Chowdhury · Modern Poetry', progress: 86, code: 'E', color: '', next: 'Tomorrow · 9:00 AM', duration: '45 min' },
];
const lessons = [
  { title: 'Calculus: Limits & Continuity', course: 'Advanced Mathematics', teacher: 'Mr. Rahman', date: 'Oct 29, 2026', length: '48 min', views: '128 views', color: 'math', type: 'recording' },
  { title: 'Newton’s Laws of Motion', course: 'Physics — Mechanics', teacher: 'Ms. Tasnim', date: 'Oct 28, 2026', length: '52 min', views: '94 views', color: 'physics', type: 'recording' },
  { title: 'Poetry of the Romantic Era', course: 'English Literature', teacher: 'Mr. Chowdhury', date: 'Oct 26, 2026', length: '39 min', views: '76 views', color: '', type: 'recording' },
  { title: 'Integration: Worked Examples', course: 'Advanced Mathematics', teacher: 'Mr. Rahman', date: 'Oct 24, 2026', length: '56 min', views: '112 views', color: 'math', type: 'recording' },
];
const materials = [
  { title: 'Chapter 4 — Calculus Notes', course: 'Advanced Mathematics', detail: 'PDF · 2.4 MB · Updated Oct 29', type: 'PDF', icon: 'file', color: 'green' },
  { title: 'Momentum & Collisions', course: 'Physics — Mechanics', detail: 'Slide deck · 8 pages · Oct 28', type: 'Slides', icon: 'book', color: 'blue' },
  { title: 'The Romantic Poets — Reading Pack', course: 'English Literature', detail: 'PDF · 1.8 MB · Oct 25', type: 'PDF', icon: 'file', color: 'gold' },
  { title: 'Practice Set: Derivatives', course: 'Advanced Mathematics', detail: 'Worksheet · 12 questions · Oct 23', type: 'Worksheet', icon: 'clipboard', color: 'violet' },
];
const assignments = [
  { title: 'Problem Set 04: Derivatives', course: 'Advanced Mathematics', due: 'Due today · 11:59 PM', status: 'Due soon', tone: 'red' },
  { title: 'Momentum Lab Report', course: 'Physics — Mechanics', due: 'Due Nov 04 · 11:59 PM', status: 'In progress', tone: 'orange' },
  { title: 'Poetry Reflection', course: 'English Literature', due: 'Submitted Oct 29', status: 'Graded · 18/20', tone: 'green' },
];
const eventList = [
  { time: '10:30 AM', title: 'Advanced Mathematics', sub: 'Chapter 4 · Mr. Rahman', color: '' },
  { time: '1:00 PM', title: 'Physics — Mechanics', sub: 'Chapter 7 · Ms. Tasnim', color: 'blue' },
  { time: '3:30 PM', title: 'Study group: Calculus', sub: 'Group room · 6 students', color: 'gold' },
];
const announcements = [
  { who: 'Aura Class team', initials: 'AC', title: 'Midterm week schedule is now live', text: 'Check your schedule for updated class times. If you need help planning, post in the Q&A forum.', time: '2 hours ago' },
  { who: 'Mr. Rahman', initials: 'MR', title: 'Extra calculus review session', text: 'I’ll host an optional review this Friday at 4:00 PM. Bring your questions from Chapter 4.', time: 'Yesterday' },
  { who: 'Ms. Tasnim', initials: 'MT', title: 'Lab report rubric posted', text: 'The grading rubric for the momentum lab is available in Notes & PDFs.', time: 'Oct 29' },
];

const demoUsers = [
  {uid:'demo-student', id:'AC-2048', name:'Ayesha Siddiqua', role:'Student', email:'ayesha@example.com', demo:true},
  {uid:'demo-teacher', id:'TC-1001', name:'Mr. Rahman', role:'Teacher', email:'rahman@example.com', demo:true},
];
const STORAGE = {profile:'aura.profile.',data:'aura.class-data.v1',demoSession:'aura.demo-session'};
function loadClassData(){try{const saved=JSON.parse(localStorage.getItem(STORAGE.data));if(saved)return saved;}catch{}return {users:[{id:'AC-2048',name:'Ayesha Siddiqua',role:'Student'},{id:'AC-2049',name:'Raihan Ahmed',role:'Student'},{id:'AC-2050',name:'Nusrat Jahan',role:'Student'},{id:'TC-1001',name:'Mr. Rahman',role:'Teacher'},{id:'TC-1002',name:'Ms. Tasnim',role:'Teacher'},{id:'TC-1003',name:'Mr. Chowdhury',role:'Teacher'}],rosters:{'TC-1001':['AC-2048','AC-2049'],'TC-1002':['AC-2048'],'TC-1003':['AC-2048']},enrollments:{'AC-2048':['math4','phys7','eng1'],'AC-2049':['math4'],'AC-2050':[]},routines:[{id:'rt-1',courseId:'math4',teacherId:'TC-1001',title:'Advanced Mathematics',topic:'Chapter 4 · Calculus',date:'2026-11-01',time:'10:30',duration:60,room:'Room A'},{id:'rt-2',courseId:'phys7',teacherId:'TC-1002',title:'Physics — Mechanics',topic:'Chapter 7 · Momentum',date:'2026-11-01',time:'13:00',duration:50,room:'Room B'},{id:'rt-3',courseId:'math4',teacherId:'TC-1001',title:'Study group: Calculus',topic:'Group room · 6 students',date:'2026-11-01',time:'15:30',duration:60,room:'Group room'}],exams:[{id:'exam-1',teacherId:'TC-1001',courseId:'math4',title:'Chapter 4: Calculus Check-in',course:'Advanced Mathematics',detail:'12 questions · 20 minutes',date:'Nov 02, 10:00 AM',duration:20,assignedStudents:['AC-2048','AC-2049']},{id:'exam-2',teacherId:'TC-1002',courseId:'phys7',title:'Mechanics: Motion & Momentum',course:'Physics — Mechanics',detail:'20 questions · 30 minutes',date:'Nov 06, 1:00 PM',duration:30,assignedStudents:['AC-2048']}]};}
let classData=loadClassData();
function persistClassData(){localStorage.setItem(STORAGE.data,JSON.stringify(classData));}
let rememberedDemo=null;try{rememberedDemo=JSON.parse(localStorage.getItem(STORAGE.demoSession));}catch{}
const state = { screen: rememberedDemo?'app':'auth', page:'home', role:rememberedDemo?.role||'Student', user:rememberedDemo||null, pendingUser:null, bookmarks:new Set([lessons[0].title,materials[1].title]), notificationsOpen:false, weekOffset:0 };
let live = null;

function sidebar() {
  const groups = state.role === 'Teacher' ? teacherNavGroups : studentNavGroups;
  const nav = groups.map(group => `<div class="nav-group">${group.label}</div>${group.items.map(([key, title, iconName, count]) => `<button class="nav-item ${state.page === key ? 'active' : ''}" data-page="${key}" title="${title}">${icon(iconName)}<span>${title}</span>${count ? `<small class="nav-count">${count}</small>` : ''}</button>`).join('')}`).join('');
  const user=state.user||demoUsers[0];const initials=user.name.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase();
  return `<aside class="sidebar">
    <div class="brand"><div class="brand-mark">${icon('sun')}</div><div class="brand-name">Aura <span>Class</span></div></div>
    <div class="profile-card"><div class="avatar large">${initials}</div><div class="profile-text"><div class="profile-name">${escapeHtml(user.name)}</div><div class="profile-sub">${state.role} ID · ${escapeHtml(user.id||'')}</div></div><span class="role-pill">${state.role}</span></div>
    <nav class="nav">${nav}</nav>
    <div class="sidebar-bottom"><div class="help-card"><strong>Need a hand?</strong><p>Get help with your classes, submissions, or account.</p><button class="help-link" data-action="help">Visit help center ↗</button></div><button class="sidebar-foot signout-button" data-action="sign-out">${icon('close')}<span>Sign out</span></button></div>
  </aside>`;
}

function topbar() {
  const user=state.user||demoUsers[0];const initials=user.name.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase();
  return `<header class="topbar"><div class="breadcrumbs"><b>Aura Class</b> <span style="color:#b1bbb5">/</span> ${pageTitle(state.page)}</div><div class="top-actions">
    <label class="search-wrap">${icon('search')}<input id="global-search" type="search" placeholder="Search anything…" aria-label="Search anything"></label>
    <button class="icon-button" data-action="notifications" aria-label="Notifications">${icon('bell')}<i class="notification-dot"></i></button><button class="icon-button signout-top" data-action="sign-out" aria-label="Sign out">${icon('close')}</button>
    <div class="top-profile"><div class="avatar">${initials}</div><div class="profile-text"><div class="profile-name">${escapeHtml(user.name)}</div><div class="profile-sub">${state.role} ID · ${escapeHtml(user.id||'')}</div></div><span class="top-profile-chevron">⌄</span></div>
  </div></header>`;
}
function pageTitle(page) { return ({ home: state.role==='Teacher'?'Teaching dashboard':'Home', classes: 'My classes', 'student-list':'Student list', recordings: 'Recordings', materials: 'Notes & PDFs', bookmarks: 'Bookmarks', assignments: 'Assignments', exams: 'Exams & quizzes', schedule: 'Schedule & routine', community: 'Community', call: 'Live classroom' })[page] || 'Home'; }
function pageHead(title, subtitle, action = '') { return `<div class="page-head"><div><div class="eyebrow">${state.role === 'Teacher' && ['home','classes'].includes(state.page) ? 'Teaching space' : 'Your learning space'}</div><h1>${title}</h1><p>${subtitle}</p></div>${action ? `<div class="head-actions">${action}</div>` : ''}</div>`; }
function btn(action, label, iconName = '', cls = 'btn-primary', attrs = '') { return `<button class="btn ${cls}" data-action="${action}" ${attrs}>${iconName ? icon(iconName) : ''}${label}</button>`; }
function courseThumb(course) { return `<div class="course-thumb ${course.color || ''}">${course.code || course.title[0]}</div>`; }
function eventRow(event) { return `<div class="event-item"><div class="event-time"><b>${event.time.split(' ')[0]}</b>${event.time.split(' ')[1]}</div><div class="event-marker ${event.color}"></div><div class="event-info"><strong>${event.title}</strong><span>${event.sub}</span></div></div>`; }
function stat(iconName, label, value, trend, color = '') { return `<div class="stat-card"><div class="stat-top"><span>${label}</span><div class="stat-icon ${color}">${icon(iconName)}</div></div><div class="stat-value">${value}<span class="stat-trend">${trend}</span></div></div>`; }
function currentId(){return state.user?.id||'';}
function allCourses(){return [...courses,...(classData.additionalCourses||[])];}
function visibleCourses(){const id=currentId();if(state.role==='Teacher')return allCourses().filter(course=>course.teacherId===id);const enrolled=classData.enrollments[id]||[];return allCourses().filter(course=>enrolled.includes(course.id)||course.studentIds?.includes(id));}
function visibleRoutines(){const id=currentId();const allowed=new Set(visibleCourses().map(course=>course.id));return classData.routines.filter(item=>state.role==='Teacher'?item.teacherId===id:(allowed.has(item.courseId)&&(!item.assignedStudents||item.assignedStudents.includes(id)))).sort((a,b)=>`${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)).map(item=>({...item,time:new Date(`2000-01-01T${item.time}`).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}),sub:`${item.topic} · ${item.room}`}));}
function visibleExams(){const id=currentId();return classData.exams.filter(item=>state.role==='Teacher'?item.teacherId===id:item.assignedStudents?.includes(id)).sort((a,b)=>a.date.localeCompare(b.date));}
function renderStudentList(){
  const roster=classData.rosters[currentId()]||[];const learners=roster.map(id=>classData.users.find(user=>user.id===id)).filter(user=>user?.role==='Student');
  return `${pageHead('Student list','Add students to your classes with their unique Student ID.',btn('add-student','Add student by ID','plus'))}<div class="student-id-card"><div><b>Your Teacher ID</b><span>Share this ID with your school coordinator.</span></div><div class="student-id-value">${escapeHtml(currentId())}</div></div><div class="panel-head"><div><div class="panel-title">Your students <span class="tag gray">${learners.length}</span></div><div class="panel-sub">Students in your class roster</div></div><label class="search-wrap" style="width:210px"><input id="student-search" placeholder="Search students…" aria-label="Search students"></label></div><div class="list-panel" id="student-list-results">${learners.map(student=>`<div class="list-row searchable-student" data-search="${escapeHtml(`${student.name} ${student.id}`.toLowerCase())}"><div class="avatar">${student.name.split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase()}</div><div class="list-row-main"><div class="list-row-title">${escapeHtml(student.name)}</div><div class="student-row-meta">Student ID · ${escapeHtml(student.id)}</div><div class="list-row-sub">${visibleCourses().filter(course=>(classData.enrollments[student.id]||course.studentIds||[]).includes(course.id)).length} assigned classes</div></div><span class="tag">Student</span><button class="icon-button" style="width:32px;height:32px" data-action="remove-student" data-id="${escapeHtml(student.id)}" aria-label="Remove student">${icon('close')}</button></div>`).join('')||`<div class="empty-state">${icon('users')}No students in this list yet. Add a Student ID to start building your roster.</div>`}</div><div class="inline-note" style="margin-top:13px"><strong>How to add:</strong> Ask the student to share their Student ID from their Aura Class account, then enter it here.</div>`;
}

function renderHome() {
  const teacher = state.role === 'Teacher';
  const user=state.user||demoUsers[0];const displayName=user.name.split(/\s+/)[0];const ownedCourses=visibleCourses();const routine=visibleRoutines();
  const hAction = teacher ? `${btn('create-class', 'Create a class', 'plus')}${btn('add-student','Add student','users','btn')}` : `${btn('join-class', 'Join a class', 'video')}`;
  const upcoming=routine[0];const upcomingCourse=ownedCourses.find(course=>course.id===upcoming?.courseId);const heroTitle=upcoming?.title|| (teacher?'Create your first class':'No class scheduled yet');const heroSubtitle=upcoming?`${upcoming.topic} · ${upcoming.room}`:(teacher?'Set a class routine for your students.':'Your teacher will share a routine here.');
  const idCard=`<div class="student-id-card"><div><b>Your ${state.role} ID</b><span>${teacher?'Share it with your students so they can identify your classes.':'Share it with your teacher to be added to a class.'}</span></div><button class="student-id-value id-copy" data-action="copy-my-id">${escapeHtml(user.id||'')}</button></div>`;
  return `${pageHead(teacher ? 'Your teaching dashboard' : `Good morning, ${escapeHtml(displayName)} ☀️`, teacher?'Manage your classes, students, and classwork in one place.':'Your classes, routine, and assignments shared by your teachers.', hAction)}${idCard}
    <section class="dashboard-hero"><div class="hero-copy"><div class="hero-label"><span class="live-pulse"></span> ${upcoming?'UP NEXT · CLASS ROUTINE':teacher?'TEACHER WORKSPACE':'CLASSROOM'}</div><h2>${escapeHtml(heroTitle)}</h2><p>${escapeHtml(heroSubtitle)}</p><div class="hero-meta"><span>${icon('clock')} ${escapeHtml(upcoming?.time||'Set a session time')}</span><span>${icon('users')} ${teacher?`${(classData.rosters[currentId()]||[]).length} students`:`${upcomingCourse?.title||'Teacher assigned'} · Shared`}</span></div><div class="hero-actions">${upcoming?btn('start-class', teacher ? 'Start class' : 'Join live class', 'video', 'btn-primary',`data-title="${escapeHtml(upcoming.title)} · ${escapeHtml(upcoming.topic)}"`):teacher?btn('create-class','Create a class','plus'):btn('join-class','Join a class','video')}${btn('schedule', teacher?'Manage routine':'View routine', 'calendar', 'btn-soft')}</div></div><div class="hero-art"><div class="art-dot one"></div><div class="art-dot two"></div><div class="art-disc">${icon('video')}</div><div class="art-label">${icon('users')} &nbsp; Learn together</div></div></section>
    <section class="stat-grid">${teacher?stat('users','Students on your roster',String((classData.rosters[currentId()]||[]).length),'Assigned by Student ID'):stat('book','Enrolled courses',String(ownedCourses.length).padStart(2,'0'),'Shared by your teachers')}${stat('video',teacher?'Your courses':'Next live classes',String(ownedCourses.length).padStart(2,'0'),teacher?'Ready to teach':'From your class routine','blue')}${stat('check',teacher?'Assigned exams': 'Assigned exams',String(visibleExams().length),'Set by your teacher','orange')}${stat('calendar','Upcoming routine',String(routine.length),'Teacher-provided','violet')}</section>
    <section class="dashboard-grid"><div class="panel"><div class="panel-head"><div><div class="panel-title">${teacher?'Your classes':'Your classes'}</div><div class="panel-sub">${teacher?'Classes you teach':'Only classes your teachers assigned to you'}</div></div><button class="text-link" data-page="classes">All classes ${icon('arrow')}</button></div>${ownedCourses.map(c => `<div class="course-row">${courseThumb(c)}<div><div class="course-title">${escapeHtml(c.title)}</div><div class="course-caption">${escapeHtml(c.subtitle)}</div><div class="progress-line"><span style="width:${c.progress}%"></span></div></div><div class="course-percent">${teacher?(classData.rosters[currentId()]||[]).length+' learners':`${c.progress}%<br>complete`}</div></div>`).join('')||`<div class="empty-state">${icon('book')}${teacher?'Create a class to begin teaching.':'Your teacher has not added classes to your account yet.'}</div>`}</div>
      <div class="panel"><div class="panel-head"><div><div class="panel-title">${teacher?'Today’s teaching routine':'Your class routine'}</div><div class="panel-sub">${teacher?'Classes and sessions you scheduled':'Shared by your teachers'}</div></div><button class="text-link" data-page="schedule">See all ${icon('arrow')}</button></div>${routine.slice(0,3).map(eventRow).join('')||`<div class="empty-state">${icon('calendar')}${teacher?'Add a class to your routine.':'Your teacher has not shared a routine yet.'}</div>`}</div></section>
    <section class="dashboard-grid" style="margin-top:16px"><div class="panel"><div class="panel-head"><div><div class="panel-title">${teacher?'Your students':'Upcoming assignments'}</div><div class="panel-sub">${teacher?'Manage your student roster':'Work assigned to your classes'}</div></div><button class="text-link" data-page="${teacher?'student-list':'assignments'}">View all ${icon('arrow')}</button></div>${teacher?(classData.rosters[currentId()]||[]).slice(0,3).map(id=>{const student=classData.users.find(u=>u.id===id);return student?`<div class="course-row"><div class="avatar">${student.name.split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase()}</div><div><div class="course-title">${escapeHtml(student.name)}</div><div class="course-caption">Student ID · ${escapeHtml(student.id)}</div></div><span class="tag">Student</span></div>`:''}).join('')||`<div class="empty-state">${icon('users')}Add a student by their Student ID.</div>`:assignments.slice(0,2).map(a => `<div class="course-row"><div class="row-icon ${a.tone === 'red' ? 'gold' : ''}">${icon('clipboard')}</div><div><div class="course-title">${a.title}</div><div class="course-caption">${a.course} · ${a.due}</div></div><span class="tag ${a.tone}">${a.status}</span></div>`).join('')}</div>
      <div class="panel"><div class="panel-head"><div><div class="panel-title">From your classroom</div><div class="panel-sub">Latest class announcements</div></div><button class="text-link" data-page="community">Open forum ${icon('arrow')}</button></div>${announcements.slice(0,2).map(a => `<div class="announcement"><div class="announcement-head"><div class="avatar" style="width:25px;height:25px;font-size:8px">${a.initials}</div><strong>${a.title}</strong><time>${a.time}</time></div><p>${a.text}</p></div>`).join('')}</div></section>`;
}

function renderClasses() {
  const owned=visibleCourses();const title=state.role==='Teacher'?'My classes':'My classes';
  return `${pageHead(title,state.role==='Teacher'?'Classes you teach and routines you set.':'Classes your teachers added to your Student ID.',`${state.role==='Student'?btn('join-class','Join a class','video','btn'):''}${state.role==='Teacher'?btn('create-class','Create a class','plus'):''}`)}
    <div class="section-grid">${owned.map((c,i) => `<article class="feature-card"><div class="feature-banner ${['','blue','gold'][i%3]}"><div class="topic-icon">${icon(i%3===0?'grid':i%3===1?'sun':'book')}</div><span class="tag">${state.role==='Teacher'?`${(classData.rosters[currentId()]||[]).length} students`:'Teacher assigned'}</span></div><div class="feature-body"><h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.subtitle)}<br>${escapeHtml(c.next||'Routine set by teacher')} · ${c.duration||'Classroom'}</p>${state.role==='Student'?`<div class="progress-line"><span style="width:${c.progress||0}%"></span></div>`:''}<div class="panel-head" style="margin:7px 0 0"><span class="course-caption">${state.role==='Teacher'?'Live teaching room':`${c.progress||0}% course progress`}</span><button class="text-link" data-action="class-detail" data-index="${i}">Open ${icon('arrow')}</button></div></div></article>`).join('')||`<div class="panel"><div class="empty-state">${icon('grid')}${state.role==='Teacher'?'You have not created a class yet.':'No class has been assigned to your Student ID yet.'}</div></div>`}</div>
    ${owned.length?`<div class="panel" style="margin-top:16px"><div class="panel-head"><div><div class="panel-title">Your next classes</div><div class="panel-sub">${state.role==='Teacher'?'Sessions you scheduled':'Your teacher-provided routine'}</div></div><button class="text-link" data-page="schedule">Open routine ${icon('arrow')}</button></div>${visibleRoutines().slice(0,5).map(eventRow).join('')}</div>`:''}`;
}
function renderRecordings() {
  const assigned=lessons.filter(lesson=>visibleCourses().some(course=>course.title===lesson.course));
  return `${pageHead('Recorded lessons','Revisit a class whenever you need a refresher.',btn('search-recordings','Find a lesson','search','btn'))}<div class="tabbar"><button class="tab active" data-tab="all">All recordings</button><button class="tab" data-tab="recent">Recently watched</button><button class="tab" data-tab="saved">Bookmarked</button></div><div class="section-grid">${assigned.map((l,i)=>`<article class="feature-card searchable" data-search="${l.title} ${l.course}"><div class="feature-banner ${l.color==='math'?'blue':l.color==='physics'?'gold':''}" style="height:128px;display:grid;place-items:center"><div class="topic-icon" style="width:48px;height:48px;border-radius:50%;color:#168454">${icon('play')}</div><span class="tag" style="position:absolute;right:12px;bottom:11px;background:#fff">${l.length}</span></div><div class="feature-body"><h3>${l.title}</h3><p>${l.course}<br>${l.teacher} · ${l.date}</p><div class="panel-head" style="margin:0"><span class="course-caption">${l.views}</span><button class="text-link" data-action="play-recording" data-index="${lessons.indexOf(l)}">Watch ${icon('arrow')}</button></div></div></article>`).join('')||`<div class="empty-state">${icon('play')}Your teachers have not shared recordings for your classes yet.</div>`}</div>`;
}
function renderMaterials(bookmarksOnly = false) {
  const enrolled=new Set(visibleCourses().map(course=>course.title));const visible = materials.filter(m => enrolled.has(m.course)&&(!bookmarksOnly || state.bookmarks.has(m.title)));
  return `${pageHead(bookmarksOnly?'Your bookmarks':'Notes & PDFs',bookmarksOnly?'Quick access to the lessons and resources you saved.':'Class notes, presentations, and study sheets in one place.',!bookmarksOnly?btn('upload-material','Add a resource','plus','btn'): '')}<div class="list-panel">${visible.map((m,i)=>`<div class="list-row searchable" data-search="${m.title} ${m.course}"><div class="row-icon ${m.color}">${icon(m.icon)}</div><div class="list-row-main"><div class="list-row-title">${m.title}</div><div class="list-row-sub">${m.course} · ${m.detail}</div></div><span class="tag gray">${m.type}</span><div class="row-actions"><button class="icon-button" style="width:32px;height:32px" data-action="toggle-bookmark" data-title="${m.title}" title="Save bookmark">${icon('bookmark')}</button><button class="icon-button" style="width:32px;height:32px" data-action="download-material" title="Download">${icon('download')}</button></div></div>`).join('') || `<div class="empty-state">${icon('bookmark')}Nothing bookmarked yet. Save notes and recordings to find them here.</div>`}</div>`;
}
function renderAssignments() {
  const assigned=assignments.filter(item=>visibleCourses().some(course=>course.title===item.course));
  return `${pageHead('Assignments','See what’s due, submit your work, and read teacher feedback.',btn('assignment-help','How submissions work','chat','btn'))}<div class="tabbar"><button class="tab active">All work <span class="nav-count">${assigned.length}</span></button><button class="tab">To do <span class="nav-count">${assigned.filter(item=>!item.status.includes('Submitted')&&!item.status.includes('Graded')).length}</span></button><button class="tab">Submitted</button></div><div class="list-panel">${assigned.map((a,i)=>`<div class="list-row"><div class="row-icon ${i===0?'gold':i===2?'blue':''}">${icon(i===2?'check':'clipboard')}</div><div class="list-row-main"><div class="list-row-title">${a.title}</div><div class="list-row-sub">${a.course} · ${a.due}</div></div><span class="tag ${a.tone}">${a.status}</span><div class="row-actions">${a.status.includes('Submitted')||a.status.includes('Graded')?btn('view-feedback','Feedback','chat','btn small'):btn('submit-assignment','Submit','arrow','btn-primary small',`data-index="${i}"`)}</div></div>`).join('')||`<div class="empty-state">${icon('clipboard')}${state.role==='Teacher'?'No work is assigned to your courses yet.':'Your teachers have not assigned any work to your classes.'}</div>`}</div>
    <div class="panel" style="margin-top:15px"><div class="panel-title">Submission checklist</div><div class="panel-sub">Accepted formats: images, PDF, and documents. You can replace your submission before the deadline.</div></div>`;
}
function renderExams() {
  const exams=visibleExams();const teacher=state.role==='Teacher';
  return `${pageHead(teacher?'Exams you assigned':'Exams from your teachers',teacher?'Create assessments for students in your classes.':'Your teachers publish assessments for your enrolled classes.',teacher?btn('create-exam','Create an exam','plus'): '')}<div class="list-panel">${exams.map((exam,i)=>`<div class="list-row"><div class="row-icon ${i%2?'gold':'blue'}">${icon('clipboard')}</div><div class="list-row-main"><div class="list-row-title">${escapeHtml(exam.title)}</div><div class="list-row-sub">${escapeHtml(exam.course)} · ${escapeHtml(exam.detail||`${exam.duration} minutes`)}</div></div><span class="tag ${teacher?'blue':'gray'}">${teacher?`${exam.assignedStudents?.length||0} assigned`:`Due ${escapeHtml(exam.date)}`}</span>${teacher?`<button class="text-link" data-action="edit-exam" data-id="${escapeHtml(exam.id)}">Manage ${icon('arrow')}</button>`:btn('start-exam','Start exam','arrow','btn-primary small',`data-index="${i}"`)}</div>`).join('')||`<div class="empty-state">${icon('clipboard')}${teacher?'No exams yet. Create an exam and assign it to your students.':'No exams have been assigned to your Student ID.'}</div>`}</div>${!teacher?`<div class="panel" style="margin-top:15px"><div class="panel-title">Your results</div><div class="panel-sub">Completed exam results will appear here after your teacher publishes them.</div></div>`:''}`;
}
function renderSchedule() {
  const routine=visibleRoutines();const teacher=state.role==='Teacher';const today=new Date();today.setDate(today.getDate()+state.weekOffset*7);const weekStart=new Date(today);weekStart.setDate(today.getDate()-((today.getDay()+6)%7));
  const isoDate=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;const week=Array.from({length:7},(_,index)=>{const date=new Date(weekStart);date.setDate(weekStart.getDate()+index);return date;});const monthDay=date=>date.toLocaleDateString('en-US',{month:'short',day:'numeric'});const rangeTitle=`${monthDay(week[0])} – ${monthDay(week[6])}, ${week[6].getFullYear()}`;
  const cards=week.map((date,index)=>{const iso=isoDate(date);const todays=routine.filter(item=>item.date===iso);const dayName=date.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase();return `<div class="day-column"><div class="day-head ${iso===isoDate(new Date())?'today':''}">${dayName}<strong>${date.getDate()}</strong></div>${todays.map(event=>`<button class="calendar-event ${index%2?'blue':''}" data-action="start-class" data-title="${escapeHtml(event.title)}">${escapeHtml(event.title)}<span class="event-clock">${escapeHtml(event.time)}</span></button>`).join('')}</div>`;}).join('');
  const rangeEvents=routine.filter(item=>item.date>=isoDate(week[0])&&item.date<=isoDate(week[6]));
  return `${pageHead(teacher?'Schedule & routine':'Your schedule & routine',teacher?'Create the class timetable your students will follow.':'Your teacher-provided classes and routine.',teacher?btn('add-routine','Add to routine','plus'):btn('reminder-settings','Reminder settings','bell','btn'))}<div class="schedule-layout"><div class="panel"><div class="panel-head"><div><div class="panel-title">${rangeTitle}</div><div class="panel-sub">${teacher?'The routine you share with assigned students.':'The timetable shared by your teachers.'}</div></div><div><button class="icon-button" data-action="week-prev" aria-label="Previous week">‹</button> <button class="icon-button" data-action="week-next" aria-label="Next week">›</button></div></div><div class="week-grid">${cards}</div></div><div class="panel"><div class="panel-title">${teacher?'Your scheduled classes':'Upcoming classes'}</div><div class="panel-sub">${rangeEvents.length} ${rangeEvents.length===1?'session':'sessions'} ${teacher?'in your routine':'shared with you'}</div>${rangeEvents.map(eventRow).join('')||`<div class="empty-state">${icon('calendar')}${teacher?'Add a class or routine item for your students.':'Your teacher has not shared a routine yet.'}</div>`}${teacher?'':`<div class="course-progress-card"><strong>Routine updates</strong><small>Your timetable changes when your teacher updates a class schedule.</small></div>`}</div></div>`;
}
function renderCommunity() {
  return `${pageHead('Community','Stay connected with classmates and instructors.',btn('new-discussion','Start a discussion','plus'))}<div class="tabbar"><button class="tab active">Announcements</button><button class="tab">Class Q&A</button><button class="tab">Study groups</button></div><div class="dashboard-grid"><div class="panel"><div class="panel-head"><div><div class="panel-title">Class announcements</div><div class="panel-sub">Updates from across your courses</div></div><button class="text-link" data-action="new-discussion">+ Post</button></div>${announcements.map(a=>`<div class="announcement"><div class="announcement-head"><div class="avatar" style="width:30px;height:30px;font-size:9px">${a.initials}</div><strong>${a.who}</strong><time>${a.time}</time></div><p><b style="color:#304238">${a.title}</b><br>${a.text}</p></div>`).join('')}</div><div class="panel"><div class="panel-title">Your study groups</div><div class="panel-sub">Learn better together</div>${[['Calculus study circle','6 members','M',''],['Physics problem solvers','4 members','P','blue'],['Friday reading club','8 members','R','gold']].map((g,i)=>`<div class="course-row"><div class="row-icon ${g[3]}">${icon('users')}</div><div><div class="course-title">${g[0]}</div><div class="course-caption">${g[1]} · ${i===0?'Active now':'Last active today'}</div></div><button class="text-link" data-action="open-group">Open ${icon('arrow')}</button></div>`).join('')}</div></div>`;
}
function renderPayments() {
  return `${pageHead('Payments & plans','Your course purchases, receipts, and payment history.',btn('enroll-course','Explore courses','plus'))}<div class="dashboard-grid"><div class="panel"><div class="panel-head"><div><div class="panel-title">Your current plan</div><div class="panel-sub">Manage your learning subscription</div></div><span class="tag">Active</span></div><div style="font:800 20px Manrope;margin:17px 0 5px">Aura Learner</div><div class="panel-sub">Full access to your enrolled courses and recordings.</div><div class="course-row" style="margin-top:12px"><div class="row-icon">${icon('wallet')}</div><div><div class="course-title">Next renewal</div><div class="course-caption">Nov 15, 2026 · Visa ending in 2048</div></div><span class="course-title">৳ 1,200</span></div>${btn('manage-plan','Manage plan','arrow','btn')}</div><div class="panel"><div class="panel-title">Payment methods</div><div class="course-row" style="margin-top:8px"><div class="row-icon blue">VISA</div><div><div class="course-title">Visa ···· 2048</div><div class="course-caption">Expires 09/28 · Primary method</div></div><span class="tag gray">Primary</span></div><button class="text-link" data-action="add-payment">+ Add payment method</button></div></div><div class="list-panel" style="margin-top:15px"><div class="list-toolbar"><h3>Recent transactions</h3><button class="text-link" data-action="download-receipts">Download receipts</button></div>${[['Aura Learner · Monthly plan','Oct 15, 2026','৳ 1,200'],['Advanced Mathematics course','Sep 15, 2026','৳ 800'],['Aura Learner · Monthly plan','Sep 15, 2026','৳ 1,200']].map(a=>`<div class="list-row"><div class="row-icon">${icon('check')}</div><div class="list-row-main"><div class="list-row-title">${a[0]}</div><div class="list-row-sub">${a[1]} · Completed</div></div><span class="course-title">${a[2]}</span><button class="icon-button" style="width:32px;height:32px" data-action="receipt" aria-label="Download receipt">${icon('download')}</button></div>`).join('')}</div>`;
}
function renderCertificates() {
  return `${pageHead('Certificates','Celebrate the courses you’ve completed.',btn('certificate-info','How to earn certificates','award','btn'))}<div class="section-grid">${[{name:'Foundations of Algebra',date:'Completed Sep 18, 2026',teacher:'Mr. Rahman'},{name:'Academic Writing Essentials',date:'Completed Aug 06, 2026',teacher:'Ms. Nabila'}].map((c,i)=>`<article class="feature-card"><div class="feature-banner ${i?'gold':''}" style="height:130px;justify-content:center;align-items:center"><div class="topic-icon" style="width:52px;height:52px;border-radius:50%">${icon('award')}</div></div><div class="feature-body"><span class="tag">Completed</span><h3 style="margin-top:9px">${c.name}</h3><p>${c.teacher}<br>${c.date}</p><button class="btn btn-soft small" data-action="download-certificate">${icon('download')} Download certificate</button></div></article>`).join('')}</div>`;
}

function renderCall() {
  const title = live?.title || 'Advanced Mathematics · Chapter 4';
  const isLive = !!live?.media;
  const callUser=state.user||demoUsers[0];const callInitials=callUser.name.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase();
  app.innerHTML = `${sidebar()}<div class="main-wrap">${topbar()}<main class="content" style="padding-top:19px"><div class="call-shell"><div class="call-header"><div class="call-title">${icon('video')} ${title} <span class="call-meta">· ${isLive ? 'Live session' : 'Preview room'}</span></div><span class="tag">${icon('users')} &nbsp; ${live?.connected ? '2 in room' : '1 in room'}</span></div>
    <div class="call-stage"><div class="video-stage" id="video-stage"><div class="call-status"><span>${live?.connected ? '● Peer connected' : '◌ Waiting for participants'}</span><span>WebRTC</span></div><div class="video-placeholder" id="placeholder"><div class="avatar">${callInitials}</div><strong>${isLive ? escapeHtml(callUser.name) : 'Camera is off'}</strong><span>${isLive ? (live.cameraOn ? 'You’re ready to learn' : 'Your camera is paused') : 'Start your camera to enter the class'}</span></div><video class="remote-video" id="remote-video" autoplay playsinline></video><video class="local-video" id="local-video" autoplay playsinline muted></video><div id="whiteboard" class="whiteboard-wrap"><div class="whiteboard-toolbar"><button class="active" data-tool="pen">✎ Pen</button><button data-tool="erase">⌫ Erase</button><button data-tool="clear">Clear board</button><span style="margin-left:auto;font-size:9px;color:#75847b">Shared whiteboard</span></div><canvas id="whiteboard-canvas" class="whiteboard-canvas"></canvas></div></div>
      <aside class="side-panel"><div class="call-side-card"><div class="call-side-title">People <span style="color:#9eb0a4">${live?.connected ? '2' : '1'}</span></div><div class="participants"><div class="avatar">${callInitials}</div><div><div class="participant-name">${escapeHtml(callUser.name)} (you)</div><div class="participant-state">${isLive ? (live.micOn ? 'Mic on' : 'Mic off') : 'Host'}</div></div></div>${live?.connected?`<div class="participants"><div class="avatar blue">${live.peerName || 'ST'}</div><div><div class="participant-name">${live.peerName || 'Classmate'}</div><div class="participant-state">Connected with WebRTC</div></div></div>`:''}</div>
      <div class="call-side-card chat-card"><div class="call-side-title">Class chat <span class="tag" style="padding:4px 6px">${live?.connected ? 'Connected' : 'Here'}</span></div><div class="chat-messages" id="chat-messages"><div class="chat-line"><b>Aura Class</b>Welcome to class! Keep questions kind and on-topic.</div>${(live?.messages || []).map(m=>`<div class="chat-line"><b>${escapeHtml(m.name)}</b>${escapeHtml(m.text)}</div>`).join('')}</div><form class="chat-form" id="chat-form"><input id="chat-input" placeholder="Message your class…" autocomplete="off"><button aria-label="Send message">${icon('send')}</button></form></div></aside></div>
    <div class="call-controls"><span class="call-time" id="call-time">${live?.timer || '00:00'}</span><button class="control-btn ${live?.micOn?'':'off'}" data-action="toggle-mic" title="Toggle microphone">${icon('mic')}</button><button class="control-btn ${live?.cameraOn?'':'off'}" data-action="toggle-camera" title="Toggle camera">${icon('camera')}</button><button class="control-btn" data-action="share-screen" title="Share screen">${icon('share')}<span>Share</span></button><button class="control-btn ${live?.raised?'active':''}" data-action="raise-hand" title="Raise hand">${icon('hand')}<span>Raise hand</span></button><button class="control-btn" data-action="toggle-whiteboard" title="Whiteboard">${icon('book')}<span>Board</span></button><button class="control-btn ${live?.recording?'active':''}" data-action="toggle-recording" title="Record class">◉<span>${live?.recording?'Recording':'Record'}</span></button><button class="control-btn leave" data-action="leave-class">${icon('close')}<span>Leave</span></button><div class="call-actions-right"><button class="control-btn" data-action="connect-peer" title="Connect a participant">${icon('users')}</button><button class="control-btn" data-action="call-reaction" title="Send a reaction">☺</button></div></div></div></main></div>`;
  if (isLive) { const local = $('#local-video'); if (local && !local.srcObject) local.srcObject = live.screenStream || live.media; }
  if (live?.remoteStream) { const remote = $('#remote-video'); remote.srcObject = live.remoteStream; remote.style.zIndex = '1'; $('#placeholder').style.display = 'none'; }
  setupWhiteboard();
  updateCallTime();
}

function renderAuth() {
  app.innerHTML=`<main class="auth-page"><section class="auth-art"><div class="auth-brand"><div class="brand-mark">${icon('sun')}</div><div class="brand-name">Aura <span>Class</span></div></div><div class="auth-art-copy"><span class="auth-kicker">A calmer way to learn</span><h1>Good things<br>happen in a<br><em>classroom.</em></h1><p>Meet your teacher, ask questions, and move forward together.</p><div class="auth-art-doodle">${icon('video')}<span>${icon('users')}</span><b>Learn together</b></div></div><div class="auth-art-foot">Live classes · Clear routines · Your learning space</div></section><section class="auth-main"><div class="auth-card"><div class="auth-mobile-brand"><div class="brand-mark">${icon('sun')}</div><div class="brand-name">Aura <span>Class</span></div></div><div class="eyebrow">WELCOME TO AURA CLASS</div><h2>Sign in to your classroom</h2><p class="auth-subtitle">Continue with an account to see your separate student or teacher workspace.</p><button class="social-button" data-action="auth-google"><span class="social-mark google-mark">G</span>Continue with Google</button><button class="social-button" data-action="auth-facebook"><span class="social-mark facebook-mark">f</span>Continue with Facebook</button><div class="auth-divider"><span>New to Aura Class?</span></div><p class="auth-caption">Choose <b>Student</b> or <b>Teacher</b> after your first sign-in. Your account gets a separate ID for that role.</p><div class="demo-heading">Explore a preview</div><div class="demo-actions"><button class="btn btn-soft" data-action="demo-student">${icon('book')} Student preview</button><button class="btn btn-soft" data-action="demo-teacher">${icon('users')} Teacher preview</button></div><div class="auth-setup-note">Google and Facebook providers must be enabled for the Firebase project.</div></div><div class="auth-footer">By continuing, you agree to use Aura Class respectfully.</div></section></main>`;
}
function renderRoleSetup() {
  const pending=state.pendingUser||{name:'New learner',email:'',uid:'new-user'};
  app.innerHTML=`<main class="auth-page role-page"><section class="auth-art"><div class="auth-brand"><div class="brand-mark">${icon('sun')}</div><div class="brand-name">Aura <span>Class</span></div></div><div class="auth-art-copy"><span class="auth-kicker">YOUR ACCOUNT, YOUR SPACE</span><h1>One place<br>to learn.<br><em>Your role.</em></h1><p>Pick how you’ll use Aura Class. Students and teachers get separate IDs and tools.</p><div class="auth-art-doodle">${icon('users')}<b>${escapeHtml(pending.name)}</b></div></div><div class="auth-art-foot">You can’t change account type later. Create a separate account for another role.</div></section><section class="auth-main"><div class="auth-card"><div class="auth-mobile-brand"><div class="brand-mark">${icon('sun')}</div><div class="brand-name">Aura <span>Class</span></div></div><div class="eyebrow">FIRST-TIME SETUP</div><h2>How will you use Aura Class?</h2><p class="auth-subtitle">${escapeHtml(pending.email||pending.name)} · choose one account type</p><button class="role-choice" data-action="finish-onboarding" data-role="Student"><span class="role-choice-icon">${icon('book')}</span><span><b>I'm a Student</b><small>Join classes, follow your teacher’s routine, and complete assigned work.</small></span>${icon('arrow')}</button><button class="role-choice" data-action="finish-onboarding" data-role="Teacher"><span class="role-choice-icon blue">${icon('users')}</span><span><b>I'm a Teacher</b><small>Create classes, add students by Student ID, and manage classwork.</small></span>${icon('arrow')}</button><button class="auth-back" data-action="cancel-onboarding">Sign out and use another account</button></div></section></main>`;
}
function updateProfileView(user) {
  localStorage.removeItem(STORAGE.demoSession);
  const userKey=`${STORAGE.profile}${user.uid}`;let profile=null;
  try{profile=JSON.parse(localStorage.getItem(userKey));}catch{}
  if(profile&&['Student','Teacher'].includes(profile.role)){
    state.user=profile;state.role=profile.role;state.screen='app';state.page='home';
    if(!classData.users.some(item=>item.id===profile.id)){classData.users.push({id:profile.id,name:profile.name,role:profile.role});persistClassData();}
  }else{state.pendingUser=user;state.user=null;state.screen='role';}
  render();
}
function finishOnboarding(role) {
  const base=state.pendingUser;if(!base||!['Student','Teacher'].includes(role))return;
  const demo=!!base.demo;const id=demo?base.id:`${role==='Student'?'AC':'TC'}-${String(base.uid).replace(/[^a-z0-9]/gi,'').toUpperCase()}`;
  const profile={uid:base.uid,id,name:base.name||base.displayName||'Aura Class user',email:base.email||'',photoURL:base.photoURL||'',role,demo};
  localStorage.setItem(`${STORAGE.profile}${profile.uid}`,JSON.stringify(profile));
  const existing=classData.users.find(item=>item.id===id);if(!existing)classData.users.push({id,name:profile.name,role});persistClassData();
  state.user=profile;state.pendingUser=null;state.role=role;state.screen='app';state.page='home';
  if(demo)localStorage.setItem(STORAGE.demoSession,JSON.stringify(profile));
  render();toast(`${role} account ready · ${role} ID ${id}`,true);
}
function startDemo(role) {
  const demo=demoUsers.find(item=>item.role===role);if(!demo)return;
  state.user=demo;state.role=role;state.screen='app';state.page='home';state.pendingUser=null;
  localStorage.setItem(STORAGE.demoSession,JSON.stringify(demo));render();
}
function endSession() {
  if(live)stopLive();
  if(state.user?.demo){localStorage.removeItem(STORAGE.demoSession);state.user=null;state.screen='auth';state.page='home';state.role='Student';render();return;}
  window.dispatchEvent(new CustomEvent('aura-signout-request'));
  state.user=null;state.pendingUser=null;state.screen='auth';state.page='home';state.role='Student';render();
}
window.addEventListener('aura-auth-state',event=>{
  const user=event.detail?.user;
  if(user)updateProfileView({uid:user.uid,name:user.displayName||user.email?.split('@')[0]||'Aura Class user',email:user.email||'',photoURL:user.photoURL||''});
  else if(state.user&&!state.user.demo){state.user=null;state.screen='auth';state.role='Student';render();}
});
window.addEventListener('aura-auth-error',event=>toast(event.detail?.message||'Sign-in could not be completed.'));

function render() {
  if(state.screen==='auth'){renderAuth();return;}
  if(state.screen==='role'){renderRoleSetup();return;}
  const teacherOnly=['student-list'];
  if(state.role!=='Teacher'&&teacherOnly.includes(state.page))state.page='home';
  if(['payments','certificates','admin'].includes(state.page))state.page='home';
  if (state.page === 'call' && live) { renderCall(); return; }
  const views = { home: renderHome, classes: renderClasses, 'student-list':renderStudentList, recordings: renderRecordings, materials: () => renderMaterials(false), bookmarks: () => renderMaterials(true), assignments: renderAssignments, exams: renderExams, schedule: renderSchedule, community: renderCommunity };
  const content = (views[state.page] || renderHome)();
  app.innerHTML = `${sidebar()}<div class="main-wrap">${topbar()}<main class="content">${content}</main></div>`;
  const search = $('#global-search');
  if (search) search.addEventListener('input', () => filterSearch(search.value));
  const studentSearch=$('#student-search');if(studentSearch)studentSearch.addEventListener('input',()=>{const q=studentSearch.value.trim().toLowerCase();document.querySelectorAll('.searchable-student').forEach(row=>row.style.display=!q||row.dataset.search.includes(q)?'':'none');});
}
function filterSearch(value) {
  const q = value.trim().toLowerCase();
  document.querySelectorAll('.searchable').forEach(el => { el.style.display = !q || el.dataset.search.toLowerCase().includes(q) ? '' : 'none'; });
  if (q && !document.querySelector('.searchable')) toast('Try searching within Recordings or Notes & PDFs.');
}
function escapeHtml(value='') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function toast(message, success = false) { toastRoot.innerHTML = `<div class="toast ${success?'success':''}">${escapeHtml(message)}</div>`; clearTimeout(toast._timer); toast._timer = setTimeout(() => { toastRoot.innerHTML = ''; }, 3200); }
function showModal(title, description, body, actions = '') {
  modalRoot.innerHTML = `<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><div class="modal-head"><div><h2>${title}</h2><p>${description}</p></div><button class="modal-close" data-action="close-modal" aria-label="Close">${icon('close')}</button></div><div class="modal-body">${body}${actions?`<div class="modal-actions">${actions}</div>`:''}</div></section></div>`;
}
function closeModal() { modalRoot.innerHTML = ''; }
function go(page) { state.page = page; closeModal(); render(); window.scrollTo({top:0,behavior:'smooth'}); }
function copyText(text) { if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text); const ta=document.createElement('textarea');ta.value=text;document.body.append(ta);ta.select();document.execCommand('copy');ta.remove();return Promise.resolve(); }
function downloadRecording(chunks, recorder) {
  const blob=new Blob(chunks,{type:recorder.mimeType||'video/webm'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;
  a.download=`aura-class-${new Date().toISOString().slice(0,10)}.webm`;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),5000);
}

function openJoinModal() {
  showModal('Join a live class','Paste the teacher’s WebRTC invite offer to connect directly. Your browser will ask for camera and microphone access.',`<div class="inline-note"><strong>About this connection:</strong> Aura Class uses WebRTC peer-to-peer media. For this no-server demo, the host shares an offer and the guest returns an answer code.</div><form id="join-form"><div class="field"><label for="class-code">Class invite offer</label><textarea id="class-code" required placeholder='Paste the invite offer JSON here…'></textarea><span class="field-hint">Ask your teacher to choose “Connect a participant” in their live classroom and share the offer with you.</span></div><div class="field"><label for="join-name">Display name</label><input id="join-name" value="Ayesha Siddiqua" required></div><div class="modal-actions"><button type="button" class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary">Join with WebRTC ${icon('arrow')}</button></div></form>`);
}
function openCreateModal() {
  showModal('Create a new class','Add a class to your teaching space and set its first routine session.',`<form id="create-form"><div class="field"><label for="class-title">Class name</label><input id="class-title" required placeholder="e.g. Advanced Mathematics"></div><div class="field"><label for="class-topic">First lesson or topic</label><input id="class-topic" required placeholder="e.g. Chapter 4 — Calculus"></div><div class="field"><label for="class-time">First session</label><input id="class-time" type="datetime-local" required></div><div class="field"><label for="class-duration">Class length</label><select id="class-duration"><option value="45">45 minutes</option><option value="50">50 minutes</option><option value="60" selected>60 minutes</option><option value="90">90 minutes</option></select></div><div class="modal-actions"><button type="button" class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary">Create class ${icon('arrow')}</button></div></form>`);
}
function openAddStudentModal(){
  const owned=visibleCourses();const checkboxes=owned.map(course=>`<label class="role-choice" style="min-height:48px;margin:0 0 6px;padding:8px"><input type="checkbox" name="student-course" value="${escapeHtml(course.id)}" ${owned.length===1?'checked':''}><span class="list-row-main"><b style="font-size:10px">${escapeHtml(course.title)}</b></span></label>`).join('');
  showModal('Add a student','Enter the Student ID they see on their Aura Class home page.',`<form id="add-student-form"><div class="field"><label for="student-id-input">Student ID</label><input id="student-id-input" required placeholder="AC-2048" autocomplete="off"><span class="field-hint">Student IDs begin with AC-. The student needs to have created an Aura Class account.</span></div><div class="field"><label>Assign them to your classes (optional)</label>${checkboxes||'<span class="field-hint">Create a class before enrolling learners.</span>'}</div><div class="modal-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn btn-primary">Add student ${icon('arrow')}</button></div></form>`);
}
function openRoutineModal(){
  const owned=visibleCourses();if(!owned.length){toast('Create a class before adding a routine session.');return;}
  showModal('Add to your class routine','Students assigned to this class will see the session on their schedule.',`<form id="routine-form"><div class="field"><label for="routine-course">Class</label><select id="routine-course">${owned.map(course=>`<option value="${escapeHtml(course.id)}">${escapeHtml(course.title)}</option>`).join('')}</select></div><div class="field"><label for="routine-topic">Lesson or session</label><input id="routine-topic" required placeholder="Chapter, topic, or study session"></div><div class="field"><label for="routine-time">Date and time</label><input id="routine-time" type="datetime-local" required></div><div class="field"><label for="routine-duration">Length</label><select id="routine-duration"><option value="45">45 minutes</option><option value="50">50 minutes</option><option value="60" selected>60 minutes</option><option value="90">90 minutes</option></select></div><div class="field"><label for="routine-room">Room or note</label><input id="routine-room" value="Live class"></div><div class="modal-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn btn-primary">Share routine ${icon('arrow')}</button></div></form>`);
}
function openExamModal(){
  const owned=visibleCourses();if(!owned.length){toast('Create a class before assigning an exam.');return;}
  showModal('Create an exam','Students in the selected class will see this assessment in Exams & quizzes.',`<form id="teacher-exam-form"><div class="field"><label for="exam-title">Exam name</label><input id="exam-title" required placeholder="Chapter check-in"></div><div class="field"><label for="exam-course">Class</label><select id="exam-course">${owned.map(course=>`<option value="${escapeHtml(course.id)}">${escapeHtml(course.title)}</option>`).join('')}</select></div><div class="field"><label for="exam-date">Due date and time</label><input id="exam-date" type="datetime-local" required></div><div class="field"><label for="exam-duration">Time limit</label><select id="exam-duration"><option value="15">15 minutes</option><option value="20" selected>20 minutes</option><option value="30">30 minutes</option><option value="60">60 minutes</option></select></div><div class="field"><label for="exam-questions">Question count</label><input id="exam-questions" type="number" min="1" max="100" value="10" required></div><div class="modal-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn btn-primary">Publish exam ${icon('arrow')}</button></div></form>`);
}
function openSignalModal(mode, value = '') {
  let title, description, intro, button, id;
  if (mode === 'offer') { title='Invite a participant';description='Send this one-time WebRTC offer to a student. They will return an answer code for you to paste here.';intro='Copy and share this offer. Keep this classroom open while the student connects.';button='I have an answer';id='signal-answer'; }
  else { title='Connect to the class';description='Paste the offer from your teacher. Aura Class will create a WebRTC answer to send back.';intro='Paste the teacher’s invitation offer below.';button='Create answer';id='signal-offer'; }
  showModal(title,description,`<div class="signal-steps"><div class="signal-step active"><b>1 · Offer</b>Share invitation</div><div class="signal-step"><b>2 · Answer</b>Exchange response</div><div class="signal-step"><b>3 · Connect</b>Join the classroom</div></div><p class="field-hint" style="margin:0 0 8px">${mode==='offer'&&value==='Preparing offer…'?'Collecting network details. Keep this window open for a moment.':intro}</p><div class="field"><label for="${id}">${mode === 'offer' ? 'WebRTC offer' : 'Teacher’s offer'}</label><textarea id="${id}" ${mode==='offer'?'readonly':''} placeholder="${mode==='offer'?'Creating secure connection offer…':'Paste WebRTC offer JSON'}">${escapeHtml(value)}</textarea></div>${mode==='offer'?`<div class="inline-note">This invite contains network connection details. Share it only with a student joining this class.</div>`:''}<div class="modal-actions">${mode==='offer'?`<button id="copy-offer" class="btn" data-action="copy-signal" data-value="offer" ${value==='Preparing offer…'?'disabled':''}>${icon('clipboard')} Copy offer</button>`:`<button class="btn" data-action="close-modal">Cancel</button>`}<button class="btn btn-primary" data-action="${mode==='offer'?'show-answer-input':'accept-offer'}">${button} ${icon('arrow')}</button></div>`);
}
function openAnswerInput() {
  showModal('Finish the WebRTC connection','Paste the answer the student sent back. Both browsers must stay open during setup.',`<div class="inline-note">The student can copy their answer from the same invite exchange. Once accepted, media travels peer-to-peer where network conditions allow.</div><div class="field"><label for="answer-input">Student answer</label><textarea id="answer-input" placeholder="Paste WebRTC answer JSON"></textarea></div><div class="modal-actions"><button class="btn" data-action="back-to-offer">Back</button><button class="btn btn-primary" data-action="apply-answer">Connect ${icon('arrow')}</button></div>`);
}
function waitForIce(pc) {
  return new Promise(resolve => {
    if (pc.iceGatheringState === 'complete') return resolve();
    const timeout = setTimeout(done, 9000);
    function done() { clearTimeout(timeout); pc.removeEventListener('icegatheringstatechange', check); resolve(); }
    function check() { if (pc.iceGatheringState === 'complete') done(); }
    pc.addEventListener('icegatheringstatechange', check);
  });
}
function rtcConfig() { return { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }; }
function wirePeer(pc, isHost) {
  pc.ontrack = ev => { live.remoteStream = ev.streams[0] || new MediaStream([ev.track]); live.connected = true; renderCall(); };
  pc.onconnectionstatechange = () => {
    if (!live) return;
    if (pc.connectionState === 'connected') { live.connected = true; renderCall(); toast('WebRTC peer connected.', true); }
    else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') { live.connected = false; renderCall(); }
  };
  pc.ondatachannel = ev => { live.dataChannel = ev.channel; wireDataChannel(ev.channel); };
  if (isHost) { live.dataChannel = pc.createDataChannel('aura-class-chat'); wireDataChannel(live.dataChannel); }
  for (const track of live.media.getTracks()) pc.addTrack(track, live.screenStream || live.media);
}
function wireDataChannel(channel) {
  channel.onmessage = ev => {
    try { const payload = JSON.parse(ev.data); if (payload.kind === 'chat') addMessage(payload.name || 'Classmate', payload.text, false); if (payload.kind === 'reaction') toast(`${payload.name || 'A classmate'} reacted ${payload.emoji}`); }
    catch { addMessage('Classmate', String(ev.data), false); }
  };
  channel.onopen = () => { if (live) { live.connected=true;renderCall(); } };
}
async function startLocalMedia() {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access needs HTTPS or localhost and a supported browser.');
  if (!live.media) live.media = await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:720}},audio:true});
  live.cameraOn = live.media.getVideoTracks().some(t => t.enabled);
  live.micOn = live.media.getAudioTracks().some(t => t.enabled);
  if (!live.startedAt) live.startedAt = Date.now();
}
async function joinClass(title = 'Advanced Mathematics · Chapter 4') {
  live = { title, media:null, remoteStream:null, screenStream:null, peer:null, dataChannel:null, connected:false, cameraOn:false, micOn:false, raised:false, recording:false, messages:[], startedAt:null, timer:'00:00', whiteboardTool:'pen' };
  state.page='call';renderCall();
  try { await startLocalMedia(); renderCall(); toast('Camera and microphone are ready.', true); }
  catch (err) { toast(err.message || 'Could not access camera or microphone.'); }
}
async function connectAsHost() {
  if (!live?.media) { toast('Start your camera before inviting a participant.'); return; }
  try {
    const pc = new RTCPeerConnection(rtcConfig()); live.peer=pc; wirePeer(pc,true);
    const offer=await pc.createOffer();await pc.setLocalDescription(offer);openSignalModal('offer','Preparing offer…');
    await waitForIce(pc);const code=JSON.stringify(pc.localDescription);const field=$('#signal-answer');if(field)field.value=code;const copy=$('#copy-offer');if(copy)copy.disabled=false;
  } catch(err) { toast(`Could not prepare WebRTC invite: ${err.message}`); }
}
async function connectAsGuest(offerText, guestName) {
  const offer=JSON.parse(offerText);
  if (!offer.type || !offer.sdp) throw new Error('That invite does not look like a valid WebRTC offer.');
  await joinClass('Live class · Connecting…');
  if (!live?.media) return;
  try {
    const pc=new RTCPeerConnection(rtcConfig());live.peer=pc;live.peerName='Teacher';wirePeer(pc,false);
    await pc.setRemoteDescription(offer);const answer=await pc.createAnswer();await pc.setLocalDescription(answer);await waitForIce(pc);
    live.title='Live class';live.peerName='Teacher';renderCall();
    showModal('Send your answer to the teacher','Copy this WebRTC answer and send it to your teacher to finish connecting.',`<div class="field"><label for="guest-answer">Your WebRTC answer</label><textarea id="guest-answer" readonly>${escapeHtml(JSON.stringify(pc.localDescription))}</textarea></div><div class="inline-note">Once the teacher applies this answer, your live audio and video will connect peer-to-peer.</div><div class="modal-actions"><button class="btn" data-action="copy-signal" data-value="guest">${icon('clipboard')} Copy answer</button><button class="btn btn-primary" data-action="close-modal">I’ve shared it ${icon('check')}</button></div>`);
    live.peerName=guestName || 'Classmate';
  } catch(err) { toast(`Could not join with WebRTC: ${err.message}`); }
}
async function applyHostAnswer(answerText) {
  try { if(!live?.peer) throw new Error('Create an invite offer first.');const answer=JSON.parse(answerText);await live.peer.setRemoteDescription(answer);closeModal();toast('Answer accepted. Connecting to the student…',true); }
  catch(err){toast(`Could not apply answer: ${err.message}`);}
}
function updateCallTime() {
  if (state.page !== 'call' || !live) return;
  if (live.startedAt) { const elapsed=Math.floor((Date.now()-live.startedAt)/1000);live.timer=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`; }
  const node=$('#call-time');if(node)node.textContent=live.timer;
  clearTimeout(updateCallTime._timer);updateCallTime._timer=setTimeout(updateCallTime,1000);
}
function addMessage(name,text,send=true) {
  if(!live)return;live.messages.push({name,text});
  if(send && live.dataChannel?.readyState==='open') live.dataChannel.send(JSON.stringify({kind:'chat',name:state.user?.name||'Student',text}));
  renderCall();const pane=$('#chat-messages');if(pane)pane.scrollTop=pane.scrollHeight;
}
async function toggleMic() { if(!live?.media){toast('Start your camera and microphone first.');return;}live.micOn=!live.micOn;live.media.getAudioTracks().forEach(t=>t.enabled=live.micOn);renderCall(); }
async function toggleCamera() { if(!live?.media){toast('Start your camera and microphone first.');return;}live.cameraOn=!live.cameraOn;live.media.getVideoTracks().forEach(t=>t.enabled=live.cameraOn);renderCall(); }
async function shareScreen() {
  if(!navigator.mediaDevices?.getDisplayMedia){toast('Screen sharing is not supported in this browser.');return;}
  try { const stream=await navigator.mediaDevices.getDisplayMedia({video:true});live.screenStream=stream;const track=stream.getVideoTracks()[0];const sender=live.peer?.getSenders().find(s=>s.track?.kind==='video');if(sender)await sender.replaceTrack(track);const video=$('#local-video');if(video)video.srcObject=stream;track.onended=()=>stopShare();toast('You are sharing your screen.',true); }
  catch(err){if(err.name!=='NotAllowedError')toast(`Could not share screen: ${err.message}`);}
}
async function stopShare() { if(!live?.screenStream)return;live.screenStream.getTracks().forEach(t=>t.stop());live.screenStream=null;const sender=live.peer?.getSenders().find(s=>s.track?.kind==='video');const camera=live.media?.getVideoTracks()[0];if(sender&&camera)await sender.replaceTrack(camera);const video=$('#local-video');if(video)video.srcObject=live.media; }
function setupWhiteboard() {
  const canvas=$('#whiteboard-canvas');if(!canvas)return;const ctx=canvas.getContext('2d');const resize=()=>{const rect=canvas.getBoundingClientRect();const ratio=window.devicePixelRatio||1;canvas.width=rect.width*ratio;canvas.height=rect.height*ratio;ctx.scale(ratio,ratio);ctx.lineWidth=2.5;ctx.lineCap='round';ctx.strokeStyle='#178456';};resize();
  let drawing=false;const point=e=>{const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
  canvas.onpointerdown=e=>{drawing=true;canvas.setPointerCapture(e.pointerId);const p=point(e);ctx.beginPath();ctx.moveTo(p.x,p.y);};canvas.onpointermove=e=>{if(!drawing)return;const p=point(e);ctx.strokeStyle=live?.whiteboardTool==='erase'?'#ffffff':'#178456';ctx.lineWidth=live?.whiteboardTool==='erase'?18:2.5;ctx.lineTo(p.x,p.y);ctx.stroke();};canvas.onpointerup=()=>{drawing=false;};
}
function makeLocalId(prefix){return `${prefix}-${Math.random().toString(36).slice(2,10).toUpperCase()}`;}
function addStudentToTeacher(studentId,courseIds){
  const student=classData.users.find(user=>user.id.toUpperCase()===studentId.toUpperCase()&&user.role==='Student');if(!student)throw new Error('No Student account has that ID in this classroom directory.');
  const roster=classData.rosters[currentId()]||(classData.rosters[currentId()]=[]);if(roster.includes(student.id))throw new Error('This student is already on your list.');roster.push(student.id);
  classData.enrollments[student.id]=classData.enrollments[student.id]||[];
  for(const courseId of courseIds){if(!classData.enrollments[student.id].includes(courseId))classData.enrollments[student.id].push(courseId);const course=allCourses().find(item=>item.id===courseId);if(course&&!course.studentIds.includes(student.id))course.studentIds.push(student.id);}
  persistClassData();
}
function removeStudentFromTeacher(studentId){
  classData.rosters[currentId()]=(classData.rosters[currentId()]||[]).filter(id=>id!==studentId);
  const owned=allCourses().filter(course=>course.teacherId===currentId());for(const course of owned){course.studentIds=(course.studentIds||[]).filter(id=>id!==studentId);classData.enrollments[studentId]=(classData.enrollments[studentId]||[]).filter(id=>id!==course.id);}
  for(const exam of classData.exams.filter(item=>item.teacherId===currentId()))exam.assignedStudents=(exam.assignedStudents||[]).filter(id=>id!==studentId);
  persistClassData();render();toast('Student removed from your classes.');
}
function stopLive() {
  if(!live)return;
  if(live.recorder?.state==='recording')live.recorder.stop();
  live.peer?.close();live.screenStream?.getTracks().forEach(t=>t.stop());live.media?.getTracks().forEach(t=>t.stop());
  clearTimeout(updateCallTime._timer);live=null;state.page='home';render();toast('You left the classroom.');
}

function openExam(index=0) {
  const questions=[{course:'Advanced Mathematics',title:'Chapter 4: Calculus Check-in',question:'What is the derivative of f(x) = x² + 3x?',choices:['2x + 3','x + 3','2x² + 3','x² + 3']},{course:'Physics — Mechanics',title:'Mechanics: Motion & Momentum',question:'Which quantity is conserved in an isolated collision system?',choices:['Momentum','Velocity','Acceleration','Force']}];
  const q=questions[index]||questions[0];let time=20*60;
  showModal(q.title,`${q.course} · Select one answer. Your response is saved locally for this preview.`, `<form id="exam-form"><div class="exam-timer" id="exam-timer">20:00 remaining</div><div class="exam-q">1. ${q.question}</div>${q.choices.map((c,i)=>`<label class="answer-choice"><input type="radio" name="answer" value="${i}" required> ${c}</label>`).join('')}<div class="field" style="margin-top:15px"><label for="exam-note">Show your working (optional)</label><textarea id="exam-note" placeholder="Write a few steps…" style="min-height:65px"></textarea></div><div class="modal-actions"><button type="button" class="btn" data-action="close-modal">Save & exit</button><button class="btn btn-primary">Submit answer ${icon('arrow')}</button></div></form>`);
  clearInterval(openExam._interval);openExam._interval=setInterval(()=>{time--;const node=$('#exam-timer');if(!node){clearInterval(openExam._interval);return;}node.textContent=`${String(Math.floor(time/60)).padStart(2,'0')}:${String(time%60).padStart(2,'0')} remaining`;if(time<=0){clearInterval(openExam._interval);toast('Time is up.');closeModal();}},1000);
}

document.addEventListener('click', async event => {
  const pageButton=event.target.closest('[data-page]');if(pageButton){go(pageButton.dataset.page);return;}
  const button=event.target.closest('[data-action]');if(!button)return;const action=button.dataset.action;
  if(action==='close-modal'){if(event.target.classList.contains('modal-backdrop')&&!event.target.contains(event.target.closest('.modal')))closeModal();else if(button.classList.contains('modal-close')||button.closest('.modal'))closeModal();return;}
  switch(action){
    case 'auth-google':window.dispatchEvent(new CustomEvent('aura-auth-request',{detail:{provider:'google'}}));break;
    case 'auth-facebook':window.dispatchEvent(new CustomEvent('aura-auth-request',{detail:{provider:'facebook'}}));break;
    case 'demo-student':startDemo('Student');break;
    case 'demo-teacher':startDemo('Teacher');break;
    case 'finish-onboarding':finishOnboarding(button.dataset.role);break;
    case 'cancel-onboarding':endSession();break;
    case 'sign-out':endSession();break;
    case 'copy-my-id':copyText(state.user?.id||'').then(()=>toast('Your ID is copied.',true));break;
    case 'add-student':openAddStudentModal();break;
    case 'remove-student':removeStudentFromTeacher(button.dataset.id);break;
    case 'add-routine':openRoutineModal();break;
    case 'create-exam':openExamModal();break;
    case 'week-prev':state.weekOffset--;render();break;
    case 'week-next':state.weekOffset++;render();break;
    case 'join-class':openJoinModal();break;
    case 'create-class':openCreateModal();break;
    case 'start-class':closeModal();await joinClass(button.dataset.title||undefined);break;
    case 'leave-class':stopLive();break;
    case 'connect-peer':await connectAsHost();break;
    case 'show-answer-input':openAnswerInput();break;
    case 'back-to-offer':await connectAsHost();break;
    case 'apply-answer':await applyHostAnswer($('#answer-input')?.value||'');break;
    case 'accept-offer':{const text=$('#signal-offer')?.value||'';const name=$('#join-name')?.value||'Classmate';try{await connectAsGuest(text,name);if(!live?.media)closeModal();}catch(err){toast(err.message||'Invalid class invite.');}break;}
    case 'copy-signal':{const value=button.dataset.value==='guest'?$('#guest-answer')?.value:$('#signal-answer')?.value;copyText(value||'').then(()=>toast('Copied to clipboard.',true));break;}
    case 'toggle-mic':await toggleMic();break;
    case 'toggle-camera':await toggleCamera();break;
    case 'share-screen':await shareScreen();break;
    case 'raise-hand':if(!live?.media){toast('Join the class first to raise your hand.');break;}live.raised=!live.raised;if(live.dataChannel?.readyState==='open')live.dataChannel.send(JSON.stringify({kind:'reaction',name:state.user?.name||'Student',emoji:live.raised?'✋':'👋'}));renderCall();toast(live.raised?'Hand raised. The teacher can see you.':'Hand lowered.');break;
    case 'toggle-whiteboard':{const board=$('#whiteboard');board.classList.toggle('visible');break;}
    case 'toggle-recording':{if(!live?.media){toast('Join the class first to record.');break;}if(!window.MediaRecorder){toast('Recording is not supported in this browser.');break;}if(live.recording){live.recording=false;live.recorder.stop();renderCall();break;}try{const stream=new MediaStream([...live.media.getTracks()]);const chunks=[];const recorder=new MediaRecorder(stream);live.chunks=chunks;live.recorder=recorder;recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=()=>{downloadRecording(chunks,recorder);toast('Your local recording has been downloaded.',true);};recorder.start();live.recording=true;renderCall();toast('Recording started on this device.',true);}catch(err){toast(`Could not start recording: ${err.message}`);}break;}
    case 'call-reaction':showModal('Send a class reaction','Choose a quick reaction to share with everyone in the class.',`<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${['👏','👍','❤️','😂','🎉','✨','🤔','🙌'].map(emoji=>`<button class="btn" style="font-size:22px;width:48px;height:48px;padding:0" data-action="send-emoji" data-emoji="${emoji}">${emoji}</button>`).join('')}</div>`);break;
    case 'send-emoji':{const emoji=button.dataset.emoji;closeModal();if(live?.dataChannel?.readyState==='open'){live.dataChannel.send(JSON.stringify({kind:'reaction',name:state.user?.name||'Student',emoji}));toast(`Reaction sent ${emoji}`,true);}else toast('Join a peer first to share reactions.');break;}
    case 'toggle-bookmark':{const title=button.dataset.title;if(state.bookmarks.has(title)){state.bookmarks.delete(title);toast('Removed from bookmarks.');}else{state.bookmarks.add(title);toast('Saved to bookmarks.',true);}render();break;}
    case 'download-material':toast('Your resource is ready to download.');break;
    case 'upload-material':toast('Resource upload is ready for a storage connection.');break;
    case 'play-recording':showModal(lessons[Number(button.dataset.index)].title,'Recorded lecture preview',`<div class="video-stage" style="min-height:240px;border-radius:12px"><div class="video-placeholder"><div class="avatar">${lessons[Number(button.dataset.index)].teacher.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><strong>Recording preview</strong><span>Connect your course video storage to play the full lesson.</span></div></div><div class="toggle-row"><span>Playback speed</span><select class="select-control"><option>0.5×</option><option>1×</option><option>1.25×</option><option>1.5×</option><option>2×</option></select></div><div class="toggle-row"><span>Save for offline</span><button class="switch" data-action="offline-toggle"></button></div>`);break;
    case 'offline-toggle':button.classList.toggle('on');toast(button.classList.contains('on')?'Saved for offline.':'Removed from offline downloads.');break;
    case 'submit-assignment':showModal('Submit assignment','Upload an image, document, or PDF. You can update this before the deadline.',`<form id="submit-form"><div class="field"><label for="submission-file">Choose a file</label><input id="submission-file" type="file" accept="image/*,.pdf,.doc,.docx" required><span class="field-hint">Accepted: images, PDF, and Word documents. Maximum 20 MB.</span></div><div class="field"><label for="submission-note">Note to your teacher (optional)</label><textarea id="submission-note" placeholder="Add a note…" style="min-height:70px"></textarea></div><div class="modal-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn btn-primary">Submit work ${icon('arrow')}</button></div></form>`);break;
    case 'view-feedback':showModal('Teacher feedback','Poetry Reflection · Graded Oct 29, 2026',`<div class="stat-value" style="font-size:29px">18/20 <span class="stat-trend">Great work!</span></div><div class="inline-note" style="margin-top:12px">Your close reading is thoughtful and clear. For next time, include one more short quote to support your final point.<br><br><strong>— Mr. Chowdhury</strong></div>`);break;
    case 'start-exam':openExam(Number(button.dataset.index));break;
    case 'practice-exam':openExam(0);break;
    case 'exam-result':showModal('Assessment result','Romantic Poetry Review · Completed Oct 28, 2026',`<div class="stat-value" style="font-size:29px">18/20 <span class="stat-trend">90% score</span></div><div class="progress-line" style="width:100%;margin-top:14px"><span style="width:90%"></span></div><p class="panel-sub" style="line-height:1.6;margin-top:13px">You answered 18 questions correctly. Review “Romantic poetry devices” in your course notes to strengthen the two topics you missed.</p>`);break;
    case 'schedule':go('schedule');break;
    case 'notifications':showModal('Notifications','Your recent class updates and reminders.',`<div class="announcement"><div class="announcement-head"><span class="live-pulse"></span><strong>Advanced Mathematics starts soon</strong><time>24 min</time></div><p>Join Mr. Rahman’s live class at 10:30 AM.</p></div><div class="announcement"><div class="announcement-head"><span class="live-pulse"></span><strong>Assignment due today</strong><time>Today</time></div><p>Problem Set 04: Derivatives is due at 11:59 PM.</p></div><div class="announcement"><div class="announcement-head"><span class="live-pulse"></span><strong>New class announcement</strong><time>2 hours</time></div><p>Midterm week schedule is now live.</p></div>`);break;
    case 'help':showModal('Aura Class help','Find answers for your learning space.',`<div class="course-row"><div class="row-icon">${icon('video')}</div><div><div class="course-title">Joining a live class</div><div class="course-caption">Check camera, microphone, and network access</div></div></div><div class="course-row"><div class="row-icon blue">${icon('clipboard')}</div><div><div class="course-title">Submitting your work</div><div class="course-caption">Supported files and submission status</div></div></div><div class="inline-note">For personalized support, ask your class administrator or instructor.</div>`);break;
    case 'assignment-help':showModal('Assignment submissions','Submit your work before the deadline.',`<div class="inline-note">Choose an image, PDF, or Word document from your device. After submission, a timestamp and status appear here. Your teacher can grade it and return written feedback.</div>`);break;
    case 'new-discussion':showModal('Start a discussion','Share a question or a helpful idea with your class.',`<form id="discussion-form"><div class="field"><label for="discussion-title">Topic</label><input id="discussion-title" required placeholder="What would you like to discuss?"></div><div class="field"><label for="discussion-body">Message</label><textarea id="discussion-body" required placeholder="Add a little context…"></textarea></div><div class="modal-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn btn-primary">Post to community ${icon('send')}</button></div></form>`);break;
    case 'open-group':toast('Study group chat is ready for a shared classroom connection.');break;
    case 'add-reminder':case 'reminder-settings':showModal('Class reminders','Choose when you’d like a heads-up before your class.',`<div class="toggle-row"><span>10 minutes before class</span><button class="switch on" data-action="reminder-toggle"></button></div><div class="toggle-row"><span>1 hour before class</span><button class="switch" data-action="reminder-toggle"></button></div><div class="toggle-row"><span>Assignment deadline reminders</span><button class="switch on" data-action="reminder-toggle"></button></div><div class="inline-note">Push notifications need browser permission and a notification service worker to work when this app is closed.</div>`);break;
    case 'reminder-toggle':button.classList.toggle('on');break;
    case 'enroll-course':showModal('Explore courses','Choose the course that fits your next goal.',`<div class="course-row"><div class="row-icon blue">${icon('grid')}</div><div class="list-row-main"><div class="course-title">Data Science Foundations</div><div class="course-caption">6 weeks · 24 lessons · ৳ 1,800</div></div><button class="btn btn-primary small" data-action="checkout">Enroll</button></div><div class="course-row"><div class="row-icon gold">${icon('book')}</div><div class="list-row-main"><div class="course-title">Academic Writing</div><div class="course-caption">4 weeks · 16 lessons · ৳ 1,200</div></div><button class="btn btn-primary small" data-action="checkout">Enroll</button></div>`);break;
    case 'checkout':showModal('Secure checkout','Complete this purchase using your preferred method.',`<div class="inline-note"><strong>Course:</strong> Data Science Foundations<br><strong>Total:</strong> ৳ 1,800 · Taxes included</div><div class="field"><label>Payment method</label><select><option>Visa ending in 2048</option><option>Mobile banking</option><option>Digital wallet</option></select></div><div class="inline-note">A live checkout requires a payment provider and server-side payment confirmation.</div><div class="modal-actions"><button class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="payment-info">Continue to secure payment ${icon('arrow')}</button></div>`);break;
    case 'payment-info':toast('Connect a payment provider to complete checkout.');break;
    case 'add-payment':toast('Connect a payment provider to add a method.');break;
    case 'manage-plan':toast('Plan management is ready for your billing provider.');break;
    case 'manage-users':showModal('User & role management','Manage access to the Aura Class learning space.',`<div class="field"><label for="user-search">Find a person</label><input id="user-search" placeholder="Search by name or email"></div>${[['AS','Ayesha Siddiqua','Student · AC-2048',''],['MR','Mr. Rahman','Teacher · Mathematics','blue'],['TN','Tasnim Nabila','Teacher · Physics','gold']].map(u=>`<div class="course-row"><div class="avatar ${u[3]}">${u[0]}</div><div class="list-row-main"><div class="course-title">${u[1]}</div><div class="course-caption">${u[2]}</div></div><select class="select-control"><option>${u[2].split(' · ')[0]}</option><option>Student</option><option>Teacher</option><option>Admin</option></select></div>`).join('')}<button class="text-link" data-action="invite-user">+ Invite a learner or teacher</button>`);break;
    case 'invite-user':showModal('Invite to Aura Class','Send an invitation to a new student or teacher.',`<form id="invite-form"><div class="field"><label for="invite-email">Email address</label><input id="invite-email" type="email" required placeholder="name@example.com"></div><div class="field"><label for="invite-role">Role</label><select id="invite-role"><option>Student</option><option>Teacher</option><option>Admin</option></select></div><div class="modal-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn btn-primary">Create invitation ${icon('arrow')}</button></div></form>`);break;
    case 'receipt':case 'download-receipts':toast('Receipt download is ready to connect to your billing service.');break;
    case 'download-certificate':toast('Your certificate PDF is ready to generate.');break;
    case 'certificate-info':showModal('How certificates work','Certificates recognize your finished learning.',`<div class="inline-note">Complete all lessons and required assessments in a course to earn its certificate. Your instructor or school may set additional requirements.</div>`);break;
    case 'class-detail':{const c=visibleCourses()[Number(button.dataset.index)];if(!c)break;showModal(c.title,c.subtitle,`<div class="course-progress-card"><strong>${state.role==='Teacher'?'Class roster':'Course progress'} · ${state.role==='Teacher'?(classData.rosters[currentId()]||[]).length+' students':`${c.progress||0}%`}</strong><div class="progress-line"><span style="width:${c.progress||0}%"></span></div><small>Next up: ${c.next||'Set in your class routine'}</small></div><div class="course-row"><div class="row-icon">${icon('video')}</div><div><div class="course-title">${state.role==='Teacher'?'Start a live class':'Upcoming live class'}</div><div class="course-caption">${c.next||'See your schedule'} · ${c.duration||'Live session'}</div></div>${btn('start-class',state.role==='Teacher'?'Start class':'Join','video','btn-primary small',`data-title="${escapeHtml(c.title)} · ${escapeHtml(c.subtitle)}"`)}</div>${state.role==='Teacher'?`<div class="course-row"><div class="row-icon blue">${icon('users')}</div><div><div class="course-title">Students enrolled</div><div class="course-caption">${(classData.enrollments?Object.entries(classData.enrollments).filter(([,ids])=>ids.includes(c.id)).length:0)} students have access</div></div><button class="text-link" data-page="student-list">Manage list ${icon('arrow')}</button></div>`:`<div class="course-row"><div class="row-icon blue">${icon('book')}</div><div><div class="course-title">Course notes</div><div class="course-caption">Study materials shared by your teacher</div></div><button class="btn btn small" data-page="materials">${icon('arrow')} Open notes</button></div>`}`);break;}
    case 'search-recordings':go('recordings');setTimeout(()=>$('#global-search')?.focus(),20);break;
    default:toast('This action is ready to connect to your class service.');
  }
});

document.addEventListener('submit', async event => {
  const form=event.target;
  if(form.id==='join-form'){event.preventDefault();try{const offer=$('#class-code').value;const name=$('#join-name').value;closeModal();await connectAsGuest(offer,name);}catch(err){toast(err.message||'Please paste a valid class invite.');}return;}
  if(form.id==='create-form'){event.preventDefault();const title=$('#class-title').value.trim();const topic=$('#class-topic').value.trim();const dateTime=$('#class-time').value;const duration=Number($('#class-duration').value);const id=makeLocalId('CL');const teacherId=currentId();const roster=classData.rosters[teacherId]||[];const course={id,teacherId,studentIds:[...roster],title,subtitle:`${state.user?.name||'Teacher'} · ${topic}`,progress:0,code:title.slice(0,1).toUpperCase(),color:'',next:localDateLabel(dateTime),duration:`${duration} min`};classData.additionalCourses=classData.additionalCourses||[];classData.additionalCourses.push(course);for(const studentId of roster){classData.enrollments[studentId]=classData.enrollments[studentId]||[];classData.enrollments[studentId].push(id);}classData.routines.push({id:makeLocalId('RT'),courseId:id,teacherId,title,topic,date:dateTime.slice(0,10),time:dateTime.slice(11,16),duration,room:'Live class',assignedStudents:[...roster]});persistClassData();closeModal();state.page='classes';render();toast('Class and first routine session created.',true);return;}
  if(form.id==='add-student-form'){event.preventDefault();const id=$('#student-id-input').value.trim().toUpperCase();const selected=[...form.querySelectorAll('input[name="student-course"]:checked')].map(input=>input.value);try{addStudentToTeacher(id,selected);closeModal();state.page='student-list';render();toast('Student added to your class list.',true);}catch(error){toast(error.message);}return;}
  if(form.id==='routine-form'){event.preventDefault();const courseId=$('#routine-course').value;const course=allCourses().find(item=>item.id===courseId);const dateTime=$('#routine-time').value;const roster=classData.rosters[currentId()]||[];classData.routines.push({id:makeLocalId('RT'),courseId,teacherId:currentId(),title:course?.title||'Class session',topic:$('#routine-topic').value.trim(),date:dateTime.slice(0,10),time:dateTime.slice(11,16),duration:Number($('#routine-duration').value),room:$('#routine-room').value.trim()||'Live class',assignedStudents:roster.filter(studentId=>(classData.enrollments[studentId]||[]).includes(courseId))});if(course)course.next=localDateLabel(dateTime);persistClassData();closeModal();state.page='schedule';render();toast('The routine is now visible to assigned students.',true);return;}
  if(form.id==='teacher-exam-form'){event.preventDefault();const courseId=$('#exam-course').value;const course=allCourses().find(item=>item.id===courseId);const due=$('#exam-date').value;const students=(classData.rosters[currentId()]||[]).filter(studentId=>(classData.enrollments[studentId]||[]).includes(courseId));classData.exams.push({id:makeLocalId('EX'),teacherId:currentId(),courseId,title:$('#exam-title').value.trim(),course:course?.title||'Class',detail:`${$('#exam-questions').value} questions · ${$('#exam-duration').value} minutes`,date:localDateLabel(due),duration:Number($('#exam-duration').value),assignedStudents:students});persistClassData();closeModal();state.page='exams';render();toast(`Exam assigned to ${students.length} students.`,true);return;}
  if(form.id==='chat-form'){event.preventDefault();const field=$('#chat-input');const text=field?.value.trim();if(text){addMessage('Ayesha',text);field.value='';}return;}
  if(form.id==='submit-form'){event.preventDefault();const file=$('#submission-file').files[0];closeModal();toast(`${file?.name||'Assignment'} submitted successfully.`,true);return;}
  if(form.id==='exam-form'){event.preventDefault();const chosen=new FormData(form).get('answer');clearInterval(openExam._interval);closeModal();toast(Number(chosen)===0?'Correct — well done! Your answer was saved.':'Answer saved. Review your feedback after the quiz.',Number(chosen)===0);return;}
  if(form.id==='discussion-form'){event.preventDefault();closeModal();toast('Your discussion was posted.',true);return;}
  if(form.id==='invite-form'){event.preventDefault();const inviteEmail=$('#invite-email')?.value||'your new user';closeModal();toast(`Invitation created for ${inviteEmail}.`,true);return;}
});

document.addEventListener('click', event => {
  const tool=event.target.closest('[data-tool]');if(tool){const board=$('#whiteboard-canvas');if(tool.dataset.tool==='clear'){board?.getContext('2d').clearRect(0,0,board.width,board.height);return;}live.whiteboardTool=tool.dataset.tool;document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b===tool));}
  const tab=event.target.closest('[data-tab]');if(tab){document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===tab));const kind=tab.dataset.tab;document.querySelectorAll('.feature-card').forEach((card,i)=>{card.style.display=kind==='saved'&&!state.bookmarks.has(lessons[i]?.title)?'none':'';});}
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal();});

render();
