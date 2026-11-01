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

const courses = [];
const lessons = [];
const materials = [];
const assignments = [];
const eventList = [];
const announcements = [];

const STORAGE = {profile:'aura.profile.',data:'aura.class-data.v1'};
function loadClassData(){
  const blank={users:[],rosters:{},enrollments:{},routines:[],exams:[],additionalCourses:[],assignments:[],materials:[],announcements:[],discussions:[],submissions:{},examResults:{},reminders:{}};
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE.data));
    if(!saved||typeof saved!=='object')return blank;
    const data={...blank,...saved};
    const seededStudents=new Set(['AC-2048','AC-2049','AC-2050']);
    const seededTeachers=new Set(['TC-1001','TC-1002','TC-1003']);
    data.users=(Array.isArray(data.users)?data.users:[]).filter(user=>!seededStudents.has(String(user.id||'').toUpperCase())&&!seededTeachers.has(String(user.id||'').toUpperCase()));
    data.rosters=data.rosters||{};for(const id of seededTeachers)delete data.rosters[id];for(const key of Object.keys(data.rosters)){data.rosters[key]=(data.rosters[key]||[]).filter(id=>!seededStudents.has(String(id).toUpperCase()));}
    data.enrollments=data.enrollments||{};for(const id of seededStudents)delete data.enrollments[id];
    data.routines=(data.routines||[]).filter(item=>!seededTeachers.has(String(item.teacherId||'').toUpperCase()));
    data.exams=(data.exams||[]).filter(item=>!seededTeachers.has(String(item.teacherId||'').toUpperCase()));
    return data;
  }catch{return blank;}
}
let classData=loadClassData();
function persistClassData(){localStorage.setItem(STORAGE.data,JSON.stringify(classData));}
localStorage.removeItem('aura.demo-session');
const state = { screen:'auth', page:'home', role:'Student', user:null, pendingUser:null, bookmarks:new Set(), notificationsOpen:false, weekOffset:0 };
let live = null;
let reminderTimers=[];

function sidebar() {
  const groups = state.role === 'Teacher' ? teacherNavGroups : studentNavGroups;
  const nav = groups.map(group => `<div class="nav-group">${group.label}</div>${group.items.map(([key, title, iconName, count]) => `<button class="nav-item ${state.page === key ? 'active' : ''}" data-page="${key}" title="${title}">${icon(iconName)}<span>${title}</span>${count ? `<small class="nav-count">${count}</small>` : ''}</button>`).join('')}`).join('');
  const user=state.user||{name:'Aura Class user',id:'',role:state.role};const initials=user.name.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase();
  return `<aside class="sidebar">
    <div class="brand"><div class="brand-mark">${icon('sun')}</div><div class="brand-name">Aura <span>Class</span></div></div>
    <button class="profile-card profile-card-button" data-action="open-profile" aria-label="Open your profile"><div class="avatar large">${initials}</div><div class="profile-text"><div class="profile-name">${escapeHtml(user.name)}</div><div class="profile-sub">${state.role} ID · ${escapeHtml(user.id||'')}</div></div><span class="role-pill">${state.role}</span></button>
    <nav class="nav">${nav}</nav>
    <div class="sidebar-bottom"><div class="help-card"><strong>Need a hand?</strong><p>Get help with your classes, submissions, or account.</p><button class="help-link" data-action="help">Visit help center ↗</button></div><button class="sidebar-foot signout-button" data-action="sign-out">${icon('close')}<span>Sign out</span></button></div>
  </aside>`;
}

function topbar() {
  const user=state.user||{name:'Aura Class user',id:'',role:state.role};const initials=user.name.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase();
  return `<header class="topbar"><div class="breadcrumbs"><b>Aura Class</b> <span style="color:#b1bbb5">/</span> ${pageTitle(state.page)}</div><div class="top-actions">
    <label class="search-wrap">${icon('search')}<input id="global-search" type="search" placeholder="Search anything…" aria-label="Search anything"></label>
    <button class="icon-button" data-action="notifications" aria-label="Notifications">${icon('bell')}<i class="notification-dot"></i></button><button class="icon-button signout-top" data-action="sign-out" aria-label="Sign out">${icon('close')}</button>
    <button class="top-profile top-profile-button" data-action="open-profile" aria-label="Open your profile"><div class="avatar">${initials}</div><div class="profile-text"><div class="profile-name">${escapeHtml(user.name)}</div><div class="profile-sub">${state.role} ID · ${escapeHtml(user.id||'')}</div></div><span class="top-profile-chevron">⌄</span></button>
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
function visibleRoutines(){const id=currentId();const allowed=new Set(visibleCourses().map(course=>course.id));return classData.routines.filter(item=>state.role==='Teacher'?item.teacherId===id:allowed.has(item.courseId)).sort((a,b)=>`${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)).map(item=>({...item,time:new Date(`2000-01-01T${item.time}`).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}),sub:`${item.topic} · ${item.room}`}));}
function visibleExams(){const id=currentId();const enrolled=new Set(classData.enrollments[id]||[]);return classData.exams.filter(item=>state.role==='Teacher'?item.teacherId===id:((item.assignedStudents||[]).includes(id)||enrolled.has(item.courseId))).sort((a,b)=>a.date.localeCompare(b.date));}
function courseFor(id){return allCourses().find(course=>course.id===id);}
function visibleAssignments(){const id=currentId();const enrolled=new Set(classData.enrollments[id]||[]);return (classData.assignments||[]).filter(item=>state.role==='Teacher'?item.teacherId===id:((item.assignedStudents||[]).includes(id)||enrolled.has(item.courseId))).sort((a,b)=>String(a.dueAt||'').localeCompare(String(b.dueAt||'')));}
function visibleMaterials(){const courseIds=new Set(visibleCourses().map(course=>course.id));return (classData.materials||[]).filter(item=>courseIds.has(item.courseId));}
function assignmentSubmission(id){return classData.submissions?.[id]?.[currentId()]||null;}
function formatDateTime(value){if(!value)return 'No deadline';const date=new Date(value);return Number.isNaN(date.getTime())?value:date.toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});}
function localDateLabel(value){if(!value)return 'No date set';const date=new Date(value);return Number.isNaN(date.getTime())?String(value):date.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});}
function renderStudentList(){
  const roster=classData.rosters[currentId()]||[];const learners=roster.map(id=>classData.users.find(user=>user.id===id)).filter(user=>user?.role==='Student');
  return `${pageHead('Student list','Add students to your classes with their unique Student ID.',btn('add-student','Add student by ID','plus'))}<div class="student-id-card"><div><b>Your Teacher ID</b><span>Click the ID to view your profile.</span></div><button class="student-id-value id-copy" data-action="open-profile" aria-label="Open your profile">${escapeHtml(currentId())}</button></div><div class="panel-head"><div><div class="panel-title">Your students <span class="tag gray">${learners.length}</span></div><div class="panel-sub">Students in your class roster</div></div><label class="search-wrap" style="width:210px"><input id="student-search" placeholder="Search students…" aria-label="Search students"></label></div><div class="list-panel" id="student-list-results">${learners.map(student=>`<div class="list-row searchable-student" data-search="${escapeHtml(`${student.name} ${student.id}`.toLowerCase())}"><div class="avatar">${student.name.split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase()}</div><button class="list-row-main profile-student-button" data-action="student-profile" data-id="${escapeHtml(student.id)}"><div class="list-row-title">${escapeHtml(student.name)}</div><div class="student-row-meta">Student ID · ${escapeHtml(student.id)}</div><div class="list-row-sub">${(classData.enrollments[student.id]||[]).length} assigned classes${student.profilePending?' · profile not synced':''}</div></button><span class="tag">Student</span><button class="icon-button" style="width:32px;height:32px" data-action="remove-student" data-id="${escapeHtml(student.id)}" aria-label="Remove student">${icon('close')}</button></div>`).join('')||`<div class="empty-state">${icon('users')}No students in this list yet. Add a Student ID to start building your roster.</div>`}</div><div class="inline-note" style="margin-top:13px"><strong>How to add:</strong> Ask the student to share their Student ID from their Aura Class profile, then enter it here.</div>`;
}

function renderHome() {
  const teacher = state.role === 'Teacher';
  const user=state.user||{name:'Aura Class user',id:''};const displayName=user.name.split(/\s+/)[0];const ownedCourses=visibleCourses();const routine=visibleRoutines();
  const hAction = teacher ? `${btn('create-class', 'Create a class', 'plus')}${btn('add-student','Add student','users','btn')}` : `${btn('join-class', 'Join a class', 'video')}`;
  const upcoming=routine[0];const upcomingCourse=ownedCourses.find(course=>course.id===upcoming?.courseId);const heroTitle=upcoming?.title|| (teacher?'Create your first class':'No class scheduled yet');const heroSubtitle=upcoming?`${upcoming.topic} · ${upcoming.room}`:(teacher?'Set a class routine for your students.':'Your teacher will share a routine here.');
  const idCard=`<div class="student-id-card"><div><b>Your ${state.role} ID</b><span>Click your ID to view all profile details.</span></div><button class="student-id-value id-copy" data-action="open-profile" aria-label="View your profile">${escapeHtml(user.id||'')}</button></div>`;
  return `${pageHead(teacher ? 'Your teaching dashboard' : `Good morning, ${escapeHtml(displayName)} ☀️`, teacher?'Manage your classes, students, and classwork in one place.':'Your classes, routine, and assignments shared by your teachers.', hAction)}${idCard}
    <section class="dashboard-hero"><div class="hero-copy"><div class="hero-label"><span class="live-pulse"></span> ${upcoming?'UP NEXT · CLASS ROUTINE':teacher?'TEACHER WORKSPACE':'CLASSROOM'}</div><h2>${escapeHtml(heroTitle)}</h2><p>${escapeHtml(heroSubtitle)}</p><div class="hero-meta"><span>${icon('clock')} ${escapeHtml(upcoming?.time||'Set a session time')}</span><span>${icon('users')} ${teacher?`${(classData.rosters[currentId()]||[]).length} students`:`${upcomingCourse?.title||'Teacher assigned'} · Shared`}</span></div><div class="hero-actions">${upcoming?btn('start-class', teacher ? 'Start class' : 'Join live class', 'video', 'btn-primary',`data-title="${escapeHtml(upcoming.title)} · ${escapeHtml(upcoming.topic)}"`):teacher?btn('create-class','Create a class','plus'):btn('join-class','Join a class','video')}${btn('schedule', teacher?'Manage routine':'View routine', 'calendar', 'btn-soft')}</div></div><div class="hero-art"><div class="art-dot one"></div><div class="art-dot two"></div><div class="art-disc">${icon('video')}</div><div class="art-label">${icon('users')} &nbsp; Learn together</div></div></section>
    <section class="stat-grid">${teacher?stat('users','Students on your roster',String((classData.rosters[currentId()]||[]).length),'Assigned by Student ID'):stat('book','Enrolled courses',String(ownedCourses.length).padStart(2,'0'),'Shared by your teachers')}${stat('video',teacher?'Your courses':'Next live classes',String(ownedCourses.length).padStart(2,'0'),teacher?'Ready to teach':'From your class routine','blue')}${stat('check',teacher?'Assigned exams': 'Assigned exams',String(visibleExams().length),'Set by your teacher','orange')}${stat('calendar','Upcoming routine',String(routine.length),'Teacher-provided','violet')}</section>
    <section class="dashboard-grid"><div class="panel"><div class="panel-head"><div><div class="panel-title">${teacher?'Your classes':'Your classes'}</div><div class="panel-sub">${teacher?'Classes you teach':'Only classes your teachers assigned to you'}</div></div><button class="text-link" data-page="classes">All classes ${icon('arrow')}</button></div>${ownedCourses.map(c => `<div class="course-row">${courseThumb(c)}<div><div class="course-title">${escapeHtml(c.title)}</div><div class="course-caption">${escapeHtml(c.subtitle)}</div><div class="progress-line"><span style="width:${c.progress}%"></span></div></div><div class="course-percent">${teacher?(classData.rosters[currentId()]||[]).length+' learners':`${c.progress}%<br>complete`}</div></div>`).join('')||`<div class="empty-state">${icon('book')}${teacher?'Create a class to begin teaching.':'Your teacher has not added classes to your account yet.'}</div>`}</div>
      <div class="panel"><div class="panel-head"><div><div class="panel-title">${teacher?'Today’s teaching routine':'Your class routine'}</div><div class="panel-sub">${teacher?'Classes and sessions you scheduled':'Shared by your teachers'}</div></div><button class="text-link" data-page="schedule">See all ${icon('arrow')}</button></div>${routine.slice(0,3).map(eventRow).join('')||`<div class="empty-state">${icon('calendar')}${teacher?'Add a class to your routine.':'Your teacher has not shared a routine yet.'}</div>`}</div></section>
    <section class="dashboard-grid" style="margin-top:16px"><div class="panel"><div class="panel-head"><div><div class="panel-title">${teacher?'Your students':'Upcoming assignments'}</div><div class="panel-sub">${teacher?'Manage your student roster':'Work assigned to your classes'}</div></div><button class="text-link" data-page="${teacher?'student-list':'assignments'}">View all ${icon('arrow')}</button></div>${teacher?(classData.rosters[currentId()]||[]).slice(0,3).map(id=>{const student=classData.users.find(u=>u.id===id);return student?`<div class="course-row"><div class="avatar">${student.name.split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase()}</div><div><div class="course-title">${escapeHtml(student.name)}</div><div class="course-caption">Student ID · ${escapeHtml(student.id)}</div></div><span class="tag">Student</span></div>`:''}).join('')||`<div class="empty-state">${icon('users')}Add a student by their Student ID.</div>`:visibleAssignments().slice(0,2).map(item=>{const submission=assignmentSubmission(item.id);return `<div class="course-row"><div class="row-icon">${icon('clipboard')}</div><div><div class="course-title">${escapeHtml(item.title)}</div><div class="course-caption">${escapeHtml(courseFor(item.courseId)?.title||'Class')} · ${submission?'Submitted':`Due ${formatDateTime(item.dueAt)}`}</div></div><span class="tag ${submission?'green':'orange'}">${submission?'Submitted':'To do'}</span></div>`;}).join('')||`<div class="empty-state">${icon('clipboard')}No assignments yet.</div>`}</div>
      <div class="panel"><div class="panel-head"><div><div class="panel-title">From your classroom</div><div class="panel-sub">Latest class announcements</div></div><button class="text-link" data-page="community">Open forum ${icon('arrow')}</button></div>${(classData.announcements||[]).slice(0,2).map(a => `<div class="announcement"><div class="announcement-head"><div class="avatar" style="width:25px;height:25px;font-size:8px">${escapeHtml(a.initials||String(a.author||'A').slice(0,2).toUpperCase())}</div><strong>${escapeHtml(a.title)}</strong><time>${escapeHtml(a.time||'Recently')}</time></div><p>${escapeHtml(a.text)}</p></div>`).join('')||`<div class="empty-state">${icon('chat')}Your teacher has not posted an update yet.</div>`}</div></section>`;
}

function renderClasses() {
  const owned=visibleCourses();const title=state.role==='Teacher'?'My classes':'My classes';
  return `${pageHead(title,state.role==='Teacher'?'Classes you teach and routines you set.':'Classes your teachers added to your Student ID.',`${state.role==='Student'?btn('join-class','Join a class','video','btn'):''}${state.role==='Teacher'?btn('create-class','Create a class','plus'):''}`)}
    <div class="section-grid">${owned.map((c,i) => `<article class="feature-card"><div class="feature-banner ${['','blue','gold'][i%3]}"><div class="topic-icon">${icon(i%3===0?'grid':i%3===1?'sun':'book')}</div><span class="tag">${state.role==='Teacher'?`${(classData.rosters[currentId()]||[]).length} students`:'Teacher assigned'}</span></div><div class="feature-body"><h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.subtitle)}<br>${escapeHtml(c.next||'Routine set by teacher')} · ${c.duration||'Classroom'}</p>${state.role==='Student'?`<div class="progress-line"><span style="width:${c.progress||0}%"></span></div>`:''}<div class="panel-head" style="margin:7px 0 0"><span class="course-caption">${state.role==='Teacher'?'Live teaching room':`${c.progress||0}% course progress`}</span><button class="text-link" data-action="class-detail" data-index="${i}">Open ${icon('arrow')}</button></div></div></article>`).join('')||`<div class="panel"><div class="empty-state">${icon('grid')}${state.role==='Teacher'?'You have not created a class yet.':'No class has been assigned to your Student ID yet.'}</div></div>`}</div>
    ${owned.length?`<div class="panel" style="margin-top:16px"><div class="panel-head"><div><div class="panel-title">Your next classes</div><div class="panel-sub">${state.role==='Teacher'?'Sessions you scheduled':'Your teacher-provided routine'}</div></div><button class="text-link" data-page="schedule">Open routine ${icon('arrow')}</button></div>${visibleRoutines().slice(0,5).map(eventRow).join('')}</div>`:''}`;
}
function renderRecordings(){
  const recordings=visibleMaterials().filter(item=>item.type==='Recording'||item.mimeType?.startsWith('video/'));
  return `${pageHead('Recorded lessons','Watch video resources shared with your classes.',state.role==='Teacher'?btn('upload-material','Add a recording','plus','btn'): '')}<div class="section-grid">${recordings.map((item,i)=>`<article class="feature-card searchable" data-search="${escapeHtml(item.title)} ${escapeHtml(courseFor(item.courseId)?.title||'')}"><div class="feature-banner ${i%2?'blue':''}" style="height:128px;display:grid;place-items:center"><div class="topic-icon" style="width:48px;height:48px;border-radius:50%;color:#168454">${icon('play')}</div><span class="tag" style="position:absolute;right:12px;bottom:11px;background:#fff">${escapeHtml(courseFor(item.courseId)?.title||'Class')}</span></div><div class="feature-body"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.fileName||'Video recording')}</p><div class="panel-head" style="margin:0"><span class="course-caption">${formatDateTime(item.createdAt)}</span><button class="text-link" data-action="play-recording" data-id="${escapeHtml(item.id)}">Watch ${icon('arrow')}</button></div></div></article>`).join('')||`<div class="empty-state">${icon('play')}No recordings have been shared with your classes yet.</div>`}</div>`;
}
function renderMaterials(bookmarksOnly=false){
  const visible=visibleMaterials().filter(item=>!bookmarksOnly||state.bookmarks.has(item.id));
  return `${pageHead(bookmarksOnly?'Your bookmarks':'Notes & PDFs',bookmarksOnly?'Quick access to the resources you saved.':'Class notes, presentations, and study sheets shared with your classes.',!bookmarksOnly&&state.role==='Teacher'?btn('upload-material','Add a resource','plus','btn'): '')}<div class="list-panel">${visible.map(item=>`<div class="list-row searchable" data-search="${escapeHtml(item.title)} ${escapeHtml(courseFor(item.courseId)?.title||'')}"><div class="row-icon">${icon(item.type==='Recording'?'play':'file')}</div><div class="list-row-main"><div class="list-row-title">${escapeHtml(item.title)}</div><div class="list-row-sub">${escapeHtml(courseFor(item.courseId)?.title||'Class')} · ${escapeHtml(item.fileName||item.type)} · ${formatDateTime(item.createdAt)}</div></div><span class="tag gray">${escapeHtml(item.type)}</span><div class="row-actions"><button class="icon-button" style="width:32px;height:32px" data-action="toggle-bookmark" data-id="${escapeHtml(item.id)}" title="Toggle bookmark">${icon('bookmark')}</button><button class="icon-button" style="width:32px;height:32px" data-action="download-material" data-id="${escapeHtml(item.id)}" title="Download">${icon('download')}</button></div></div>`).join('')||`<div class="empty-state">${icon('bookmark')}${bookmarksOnly?'Nothing bookmarked yet. Save a resource to find it here.':'No resources have been shared with your classes yet.'}</div>`}</div>`;
}
function renderAssignments(){
  const teacher=state.role==='Teacher';const assigned=visibleAssignments();
  return `${pageHead(teacher?'Assignments you created':'Your assignments',teacher?'Publish work for students in your classes.':'Submit work and review teacher feedback.',teacher?btn('create-assignment','Create assignment','plus'):btn('assignment-help','Submission help','chat','btn'))}<div class="list-panel">${assigned.map(item=>{const submissions=classData.submissions?.[item.id]||{};const mine=submissions[currentId()];const course=courseFor(item.courseId);const status=teacher?`${Object.keys(submissions).length} submitted`:mine?.grade!=null?`Graded · ${mine.grade}/${item.points||100}`:mine?'Submitted':'To do';const action=teacher?btn('view-submissions','View submissions','arrow','btn small',`data-id="${escapeHtml(item.id)}"`):mine?.grade!=null?btn('view-feedback','Feedback','chat','btn small',`data-id="${escapeHtml(item.id)}"`):btn('submit-assignment',mine?'Update':'Submit','arrow','btn-primary small',`data-id="${escapeHtml(item.id)}"`);return `<div class="list-row"><div class="row-icon">${icon(mine?'check':'clipboard')}</div><div class="list-row-main"><div class="list-row-title">${escapeHtml(item.title)}</div><div class="list-row-sub">${escapeHtml(course?.title||'Class')} · Due ${formatDateTime(item.dueAt)}</div></div><span class="tag ${mine?.grade!=null?'green':mine?'blue':'orange'}">${escapeHtml(status)}</span><div class="row-actions">${action}</div></div>`;}).join('')||`<div class="empty-state">${icon('clipboard')}${teacher?'Create an assignment for one of your classes.':'Your teachers have not assigned work to your classes yet.'}</div>`}</div>`;
}
function renderExams(){
  const exams=visibleExams();const teacher=state.role==='Teacher';
  return `${pageHead(teacher?'Exams you assigned':'Exams from your teachers',teacher?'Create assessments for students in your classes.':'Your teachers publish assessments for your enrolled classes.',teacher?btn('create-exam','Create an exam','plus'): '')}<div class="list-panel">${exams.map((exam,i)=>{const result=classData.examResults?.[exam.id]?.[currentId()];const status=result?.needsReview?'Awaiting review':result?`Score ${result.score}/${result.total}`:`Due ${formatDateTime(exam.dueAt)}`;return `<div class="list-row searchable" data-search="${escapeHtml(exam.title)} ${escapeHtml(courseFor(exam.courseId)?.title||'')}"><div class="row-icon ${i%2?'gold':'blue'}">${icon('clipboard')}</div><div class="list-row-main"><div class="list-row-title">${escapeHtml(exam.title)}</div><div class="list-row-sub">${escapeHtml(courseFor(exam.courseId)?.title||'Class')} · ${escapeHtml(exam.detail||`${exam.duration} minutes`)}</div></div><span class="tag ${teacher?'blue':result?.needsReview?'orange':result?'green':'gray'}">${teacher?`${exam.assignedStudents?.length||0} assigned`:status}</span>${teacher?`<button class="text-link" data-action="edit-exam" data-id="${escapeHtml(exam.id)}">Manage ${icon('arrow')}</button>`:result?btn('exam-result','View result','check','btn small',`data-id="${escapeHtml(exam.id)}"`):btn('start-exam','Start exam','arrow','btn-primary small',`data-id="${escapeHtml(exam.id)}"`)}</div>`;}).join('')||`<div class="empty-state">${icon('clipboard')}${teacher?'Create an exam for one of your classes.':'No exams have been assigned to your Student ID.'}</div>`}</div>`;
}
function renderCommunity(){
  const posts=[...(classData.announcements||[]).map(item=>({...item,kind:'Announcement'})),...(classData.discussions||[]).map(item=>({...item,kind:'Discussion'}))].sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  return `${pageHead('Community','Post updates and questions for your classes.',btn('new-discussion',state.role==='Teacher'?'Post announcement':'Start a discussion','plus'))}<div class="dashboard-grid"><div class="panel"><div class="panel-head"><div><div class="panel-title">Class updates and discussions</div><div class="panel-sub">${posts.length} posts</div></div></div>${posts.map(item=>`<div class="announcement"><div class="announcement-head"><div class="avatar" style="width:30px;height:30px;font-size:9px">${escapeHtml(item.initials||String(item.author||'A').slice(0,2).toUpperCase())}</div><strong>${escapeHtml(item.author||'Aura Class user')} · ${escapeHtml(item.kind)}</strong><time>${escapeHtml(item.time||'Recently')}</time></div><p><b style="color:#304238">${escapeHtml(item.title)}</b><br>${escapeHtml(item.text)}</p></div>`).join('')||`<div class="empty-state">${icon('chat')}No posts yet. Start a class discussion.</div>`}</div><div class="panel"><div class="panel-title">Your study groups</div><div class="panel-sub">Create groups through your class community.</div><div class="empty-state">${icon('users')}No study groups have been created.</div><button class="btn btn-soft" data-action="new-discussion">Ask a question ${icon('arrow')}</button></div></div>`;
}function renderSchedule() {
  const routine=visibleRoutines();const teacher=state.role==='Teacher';const today=new Date();today.setDate(today.getDate()+state.weekOffset*7);const weekStart=new Date(today);weekStart.setDate(today.getDate()-((today.getDay()+6)%7));
  const isoDate=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;const week=Array.from({length:7},(_,index)=>{const date=new Date(weekStart);date.setDate(weekStart.getDate()+index);return date;});const monthDay=date=>date.toLocaleDateString('en-US',{month:'short',day:'numeric'});const rangeTitle=`${monthDay(week[0])} – ${monthDay(week[6])}, ${week[6].getFullYear()}`;
  const cards=week.map((date,index)=>{const iso=isoDate(date);const todays=routine.filter(item=>item.date===iso);const dayName=date.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase();return `<div class="day-column"><div class="day-head ${iso===isoDate(new Date())?'today':''}">${dayName}<strong>${date.getDate()}</strong></div>${todays.map(event=>`<button class="calendar-event ${index%2?'blue':''}" data-action="start-class" data-title="${escapeHtml(event.title)}">${escapeHtml(event.title)}<span class="event-clock">${escapeHtml(event.time)}</span></button>`).join('')}</div>`;}).join('');
  const rangeEvents=routine.filter(item=>item.date>=isoDate(week[0])&&item.date<=isoDate(week[6]));
  return `${pageHead(teacher?'Schedule & routine':'Your schedule & routine',teacher?'Create the class timetable your students will follow.':'Your teacher-provided classes and routine.',teacher?btn('add-routine','Add to routine','plus'):btn('reminder-settings','Reminder settings','bell','btn'))}<div class="schedule-layout"><div class="panel"><div class="panel-head"><div><div class="panel-title">${rangeTitle}</div><div class="panel-sub">${teacher?'The routine you share with assigned students.':'The timetable shared by your teachers.'}</div></div><div><button class="icon-button" data-action="week-prev" aria-label="Previous week">‹</button> <button class="icon-button" data-action="week-next" aria-label="Next week">›</button></div></div><div class="week-grid">${cards}</div></div><div class="panel"><div class="panel-title">${teacher?'Your scheduled classes':'Upcoming classes'}</div><div class="panel-sub">${rangeEvents.length} ${rangeEvents.length===1?'session':'sessions'} ${teacher?'in your routine':'shared with you'}</div>${rangeEvents.map(eventRow).join('')||`<div class="empty-state">${icon('calendar')}${teacher?'Add a class or routine item for your students.':'Your teacher has not shared a routine yet.'}</div>`}${teacher?'':`<div class="course-progress-card"><strong>Routine updates</strong><small>Your timetable changes when your teacher updates a class schedule.</small></div>`}</div></div>`;
}
function renderCall() {
  const title = escapeHtml(live?.title || 'Live classroom');
  const isLive = !!live?.media;
  const callUser=state.user||{name:'Aura Class user'};const callInitials=callUser.name.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase();
  app.innerHTML = `${sidebar()}<div class="main-wrap">${topbar()}<main class="content" style="padding-top:19px"><div class="call-shell"><div class="call-header"><div class="call-title">${icon('video')} ${title} <span class="call-meta">· ${isLive ? 'Live session' : 'Preparing room'}</span></div><span class="tag">${icon('users')} &nbsp; ${live?.connected ? '2 in room' : '1 in room'}</span></div>
    <div class="call-stage"><div class="video-stage" id="video-stage"><div class="call-status"><span>${live?.connected ? '● Peer connected' : '◌ Waiting for participants'}</span><span>WebRTC</span></div><div class="video-placeholder" id="placeholder"><div class="avatar">${callInitials}</div><strong>${isLive ? escapeHtml(callUser.name) : 'Camera is off'}</strong><span>${isLive ? (live.cameraOn ? 'You’re ready to learn' : 'Your camera is paused') : 'Start your camera to enter the class'}</span></div><video class="remote-video" id="remote-video" autoplay playsinline></video><video class="local-video" id="local-video" autoplay playsinline muted></video><div id="whiteboard" class="whiteboard-wrap ${live?.whiteboardVisible?'visible':''}"><div class="whiteboard-toolbar"><button class="active" data-tool="pen">✎ Pen</button><button data-tool="erase">⌫ Erase</button><button data-tool="clear">Clear board</button><span style="margin-left:auto;font-size:9px;color:#75847b">Shared whiteboard</span></div><canvas id="whiteboard-canvas" class="whiteboard-canvas"></canvas></div></div>
      <aside class="side-panel"><div class="call-side-card"><div class="call-side-title">People <span style="color:#9eb0a4">${live?.connected ? '2' : '1'}</span></div><div class="participants"><div class="avatar">${callInitials}</div><div><div class="participant-name">${escapeHtml(callUser.name)} (you)</div><div class="participant-state">${isLive ? (live.micOn ? 'Mic on' : 'Mic off') : 'Host'}</div></div></div>${live?.connected?`<div class="participants"><div class="avatar blue">${escapeHtml(live.peerName || 'ST')}</div><div><div class="participant-name">${escapeHtml(live.peerName || 'Classmate')}</div><div class="participant-state">Connected with WebRTC</div></div></div>`:''}</div>
      <div class="call-side-card chat-card"><div class="call-side-title">Class chat <span class="tag" style="padding:4px 6px">${live?.connected ? 'Connected' : 'Here'}</span></div><div class="chat-messages" id="chat-messages"><div class="chat-line"><b>Aura Class</b>Welcome to class! Keep questions kind and on-topic.</div>${(live?.messages || []).map(m=>`<div class="chat-line"><b>${escapeHtml(m.name)}</b>${escapeHtml(m.text)}</div>`).join('')}</div><form class="chat-form" id="chat-form"><input id="chat-input" placeholder="Message your class…" autocomplete="off"><button aria-label="Send message">${icon('send')}</button></form></div></aside></div>
    <div class="call-controls"><span class="call-time" id="call-time">${live?.timer || '00:00'}</span><button class="control-btn ${live?.micOn?'':'off'}" data-action="toggle-mic" title="Toggle microphone">${icon('mic')}</button><button class="control-btn ${live?.cameraOn?'':'off'}" data-action="toggle-camera" title="Toggle camera">${icon('camera')}</button><button class="control-btn" data-action="share-screen" title="Share screen">${icon('share')}<span>Share</span></button><button class="control-btn ${live?.raised?'active':''}" data-action="raise-hand" title="Raise hand">${icon('hand')}<span>Raise hand</span></button><button class="control-btn" data-action="toggle-whiteboard" title="Whiteboard">${icon('book')}<span>Board</span></button><button class="control-btn ${live?.recording?'active':''}" data-action="toggle-recording" title="Record class">◉<span>${live?.recording?'Recording':'Record'}</span></button><button class="control-btn leave" data-action="leave-class">${icon('close')}<span>Leave</span></button><div class="call-actions-right"><button class="control-btn" data-action="connect-peer" title="Connect a participant">${icon('users')}</button><button class="control-btn" data-action="call-reaction" title="Send a reaction">☺</button></div></div></div></main></div>`;
  if (isLive) { const local = $('#local-video'); if (local && !local.srcObject) local.srcObject = live.screenStream || live.media; }
  if (live?.remoteStream) { const remote = $('#remote-video'); remote.srcObject = live.remoteStream; remote.style.zIndex = '1'; $('#placeholder').style.display = 'none'; }
  setupWhiteboard();
  updateCallTime();
}

function renderAuth() {
  app.innerHTML=`<main class="auth-page"><section class="auth-art"><div class="auth-brand"><div class="brand-mark">${icon('sun')}</div><div class="brand-name">Aura <span>Class</span></div></div><div class="auth-art-copy"><span class="auth-kicker">A calmer way to learn</span><h1>Good things<br>happen in a<br><em>classroom.</em></h1><p>Meet your teacher, ask questions, and move forward together.</p><div class="auth-art-doodle">${icon('video')}<span>${icon('users')}</span><b>Learn together</b></div></div><div class="auth-art-foot">Live classes · Clear routines · Your learning space</div></section><section class="auth-main"><div class="auth-card"><div class="auth-mobile-brand"><div class="brand-mark">${icon('sun')}</div><div class="brand-name">Aura <span>Class</span></div></div><div class="eyebrow">WELCOME TO AURA CLASS</div><h2>Sign in to your classroom</h2><p class="auth-subtitle">Continue with an account to see your separate student or teacher workspace.</p><button class="social-button" data-action="auth-google"><span class="social-mark google-mark">G</span>Continue with Google</button><button class="social-button" data-action="auth-facebook"><span class="social-mark facebook-mark">f</span>Continue with Facebook</button><div class="auth-divider"><span>New to Aura Class?</span></div><p class="auth-caption">Choose <b>Student</b> or <b>Teacher</b> after your first sign-in. Your account gets a separate ID for that role.</p><div class="auth-setup-note">Google and Facebook providers must be enabled for the Firebase project.</div></div><div class="auth-footer">By continuing, you agree to use Aura Class respectfully.</div></section></main>`;
}
function renderRoleSetup() {
  const pending=state.pendingUser||{name:'New learner',email:'',uid:'new-user'};
  app.innerHTML=`<main class="auth-page role-page"><section class="auth-art"><div class="auth-brand"><div class="brand-mark">${icon('sun')}</div><div class="brand-name">Aura <span>Class</span></div></div><div class="auth-art-copy"><span class="auth-kicker">YOUR ACCOUNT, YOUR SPACE</span><h1>One place<br>to learn.<br><em>Your role.</em></h1><p>Pick how you’ll use Aura Class. Students and teachers get separate IDs and tools.</p><div class="auth-art-doodle">${icon('users')}<b>${escapeHtml(pending.name)}</b></div></div><div class="auth-art-foot">You can’t change account type later. Create a separate account for another role.</div></section><section class="auth-main"><div class="auth-card"><div class="auth-mobile-brand"><div class="brand-mark">${icon('sun')}</div><div class="brand-name">Aura <span>Class</span></div></div><div class="eyebrow">FIRST-TIME SETUP</div><h2>How will you use Aura Class?</h2><p class="auth-subtitle">${escapeHtml(pending.email||pending.name)} · choose one account type</p><button class="role-choice" data-action="finish-onboarding" data-role="Student"><span class="role-choice-icon">${icon('book')}</span><span><b>I'm a Student</b><small>Join classes, follow your teacher’s routine, and complete assigned work.</small></span>${icon('arrow')}</button><button class="role-choice" data-action="finish-onboarding" data-role="Teacher"><span class="role-choice-icon blue">${icon('users')}</span><span><b>I'm a Teacher</b><small>Create classes, add students by Student ID, and manage classwork.</small></span>${icon('arrow')}</button><button class="auth-back" data-action="cancel-onboarding">Sign out and use another account</button></div></section></main>`;
}
function authProfile(user, role, id) {
  const providerIds=[...(user.providerData||[])].map(provider=>provider.providerId).filter(Boolean);
  const provider=providerIds.includes('google.com')?'Google':providerIds.includes('facebook.com')?'Facebook':(providerIds[0]||'Account').replace('.com','');
  return {uid:user.uid,id,name:user.displayName||user.name||user.email?.split('@')[0]||'Aura Class user',email:user.email||'',photoURL:user.photoURL||'',role,provider,emailVerified:!!user.emailVerified,createdAt:user.metadata?.creationTime||'',lastSignInTime:user.metadata?.lastSignInTime||''};
}
function saveDirectoryProfile(profile) {
  const index=classData.users.findIndex(item=>item.uid===profile.uid||item.id===profile.id);
  if(index>=0)classData.users[index]={...classData.users[index],...profile,profilePending:false};else classData.users.push({...profile,profilePending:false});
  persistClassData();
}
function updateProfileView(user) {
  const userKey=`${STORAGE.profile}${user.uid}`;let profile=null;
  try{profile=JSON.parse(localStorage.getItem(userKey));}catch{}
  if(profile&&['Student','Teacher'].includes(profile.role)){
    state.user={...authProfile(user,profile.role,profile.id),...profile,name:user.displayName||profile.name,email:user.email||profile.email||'',photoURL:user.photoURL||profile.photoURL||'',provider:authProfile(user,profile.role,profile.id).provider,emailVerified:!!user.emailVerified,createdAt:user.metadata?.creationTime||profile.createdAt||'',lastSignInTime:user.metadata?.lastSignInTime||profile.lastSignInTime||''};
    localStorage.setItem(userKey,JSON.stringify(state.user));state.role=profile.role;state.screen='app';state.page='home';state.bookmarks=new Set(classData.bookmarks?.[profile.id]||[]);saveDirectoryProfile(state.user);scheduleBrowserReminders();
  }else{state.pendingUser=user;state.user=null;state.screen='role';}
  render();
}
function finishOnboarding(role) {
  const base=state.pendingUser;if(!base||!['Student','Teacher'].includes(role))return;
  const id=`${role==='Student'?'AC':'TC'}-${String(base.uid).replace(/[^a-z0-9]/gi,'').toUpperCase()}`;
  const profile=authProfile(base,role,id);
  localStorage.setItem(`${STORAGE.profile}${profile.uid}`,JSON.stringify(profile));
  saveDirectoryProfile(profile);
  state.user=profile;state.pendingUser=null;state.role=role;state.screen='app';state.page='home';state.bookmarks=new Set(classData.bookmarks?.[profile.id]||[]);
  render();scheduleBrowserReminders();toast(`${role} account ready · ${role} ID ${id}`,true);
}
function endSession() {
  if(live)stopLive();
  window.dispatchEvent(new CustomEvent('aura-signout-request'));
  state.user=null;state.pendingUser=null;state.screen='auth';state.page='home';state.role='Student';render();
}
window.addEventListener('aura-auth-state',event=>{
  const user=event.detail?.user;
  if(user)updateProfileView(user);
  else if(state.user){state.user=null;state.screen='auth';state.role='Student';render();}
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
  showModal('Add a student','Enter the Student ID they see on their Aura Class profile.',`<form id="add-student-form"><div class="field"><label for="student-id-input">Student ID</label><input id="student-id-input" required pattern="AC-[A-Za-z0-9]+" placeholder="AC-2048" autocomplete="off"><span class="field-hint">Student IDs start with AC-. Choose the classes they can access.</span></div><div class="field"><label>Assign them to your classes (optional)</label>${checkboxes||'<span class="field-hint">Create a class before enrolling learners.</span>'}</div><div class="modal-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn btn-primary">Add student ${icon('arrow')}</button></div></form>`);
}
function openUserProfile(profile=state.user){
  if(!profile)return;
  const role=profile.role||'User';const id=profile.id||'Not assigned';const fields=[['Full name',profile.name||'Not provided'],['Email address',profile.email||'Not available'],['Account type',role], [`${role} ID`,id],['Sign-in method',profile.provider||'Not available']];
  if(profile.uid&&profile.uid===state.user?.uid){fields.push(['Email verified',profile.emailVerified?'Yes':'No']);if(profile.createdAt)fields.push(['Account created',profile.createdAt]);if(profile.lastSignInTime)fields.push(['Last sign-in',profile.lastSignInTime]);}
  if(profile.profilePending)fields[1]=['Profile status','Account profile is not available in this browser yet'];
  const body=`<div class="profile-detail-card"><div class="avatar large">${escapeHtml((profile.name||'U').split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase())}</div><div><strong>${escapeHtml(profile.name||'Aura Class user')}</strong><span>${escapeHtml(role)} · ${escapeHtml(id)}</span></div></div><div class="profile-detail-list">${fields.map(([label,value])=>`<div class="profile-detail-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}</div>${profile.profilePending?'<div class="inline-note">This Student ID is on the teacher’s local list. Connect the Realtime Database to look up accounts and share rosters between devices.</div>':''}<div class="modal-actions"><button class="btn btn-soft" data-action="copy-profile-id" data-id="${escapeHtml(id)}">${icon('clipboard')} Copy ID</button></div>`;
  showModal(profile.uid===state.user?.uid?'Your profile':`${role} profile`,'Your Aura Class account details.',body);
}
function openUploadMaterialModal(){
  const owned=visibleCourses();if(!owned.length){toast('Create a class before adding a resource.');return;}
  showModal('Add a class resource','Upload a PDF, image, document, or class recording. The file is saved in this browser.',`<form id="material-form"><div class="field"><label for="material-title">Resource title</label><input id="material-title" required placeholder="Chapter notes or lecture recording"></div><div class="field"><label for="material-course">Class</label><select id="material-course">${owned.map(course=>`<option value="${escapeHtml(course.id)}">${escapeHtml(course.title)}</option>`).join('')}</select></div><div class="field"><label for="material-type">Resource type</label><select id="material-type"><option>PDF</option><option>Slides</option><option>Worksheet</option><option>Recording</option><option>Other</option></select></div><div class="field"><label for="material-file">Choose file</label><input id="material-file" type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,image/*,video/*" required><span class="field-hint">For this browser version, files must be 1.5 MB or smaller.</span></div><div class="modal-actions"><button type="button" class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary">Share resource ${icon('arrow')}</button></div></form>`);
}
function openCreateAssignmentModal(){
  const owned=visibleCourses();if(!owned.length){toast('Create a class before assigning work.');return;}
  showModal('Create an assignment','Students enrolled in the selected class will see it.',`<form id="create-assignment-form"><div class="field"><label for="assignment-title">Assignment title</label><input id="assignment-title" required placeholder="Chapter 2 problem set"></div><div class="field"><label for="assignment-course">Class</label><select id="assignment-course">${owned.map(course=>`<option value="${escapeHtml(course.id)}">${escapeHtml(course.title)}</option>`).join('')}</select></div><div class="field"><label for="assignment-instructions">Instructions</label><textarea id="assignment-instructions" required placeholder="Explain what students should submit…"></textarea></div><div class="field"><label for="assignment-due">Deadline</label><input id="assignment-due" type="datetime-local" required></div><div class="modal-actions"><button type="button" class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary">Publish assignment ${icon('arrow')}</button></div></form>`);
}
function openSubmitAssignmentModal(id){
  const item=classData.assignments.find(assignment=>assignment.id===id);if(!item)return;
  const existing=assignmentSubmission(id);
  showModal(existing?'Update submission':'Submit assignment',`${item.title} · Due ${formatDateTime(item.dueAt)}`,`<div class="inline-note">${escapeHtml(item.instructions||'Upload your completed work.')}</div><form id="submit-form" data-id="${escapeHtml(id)}"><div class="field"><label for="submission-file">Choose a file</label><input id="submission-file" type="file" accept="image/*,.pdf,.doc,.docx" ${existing?'':'required'}><span class="field-hint">Maximum 1.5 MB in this browser version. Leave the file empty to keep the previous upload.</span></div><div class="field"><label for="submission-note">Note to your teacher</label><textarea id="submission-note" placeholder="Add a note…">${escapeHtml(existing?.note||'')}</textarea></div><div class="modal-actions"><button type="button" class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary">Submit work ${icon('arrow')}</button></div></form>`);
}
function openReminderModal(){
  const prefs=classData.reminders?.[currentId()]||{tenMinutes:true,oneHour:false};
  showModal('Class reminders','Browser reminders can notify you while Aura Class is open.',`<div class="toggle-row"><span>10 minutes before class</span><button class="switch ${prefs.tenMinutes?'on':''}" data-action="reminder-toggle" data-key="tenMinutes"></button></div><div class="toggle-row"><span>1 hour before class</span><button class="switch ${prefs.oneHour?'on':''}" data-action="reminder-toggle" data-key="oneHour"></button></div><div class="inline-note">Allow notifications when your browser asks. These local reminders do not run when the browser is closed; background push needs the Firebase messaging service and a trusted sender.</div>`);
}
function readFileData(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('Could not read that file.'));reader.onload=()=>resolve(reader.result);reader.readAsDataURL(file);});}
function scheduleBrowserReminders(){
  reminderTimers.forEach(timer=>clearTimeout(timer));reminderTimers=[];
  if(!state.user||!('Notification'in window)||Notification.permission!=='granted')return;
  const prefs=classData.reminders?.[currentId()]||{tenMinutes:true,oneHour:false};const now=Date.now();
  for(const item of visibleRoutines()){
    const raw=classData.routines.find(routine=>routine.id===item.id);if(!raw)continue;const start=new Date(`${raw.date}T${raw.time}:00`).getTime();if(!Number.isFinite(start))continue;
    for(const [enabled,offset] of [[prefs.oneHour,60*60*1000],[prefs.tenMinutes,10*60*1000]]){const delay=start-offset-now;if(enabled&&delay>0&&delay<2147480000){reminderTimers.push(setTimeout(()=>new Notification(`Class starts soon: ${raw.title}`,{body:`${raw.topic} · ${raw.room} · ${new Date(start).toLocaleTimeString()}`}),delay));}}
  }
}
function downloadFile(name,dataUrl){if(!dataUrl){toast('This resource has no file attached.');return;}const link=document.createElement('a');link.href=dataUrl;link.download=name||'aura-class-resource';document.body.append(link);link.click();link.remove();}
function openRecording(item){if(!item?.dataUrl){toast('The video file is unavailable in this browser.');return;}showModal(item.title,'Class recording',`<video id="recording-player" controls playsinline style="width:100%;max-height:55vh;background:#111;border-radius:10px" src="${escapeHtml(item.dataUrl)}"></video><div class="toggle-row"><span>Playback speed</span><select id="recording-speed" class="select-control"><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></div><div class="modal-actions"><button class="btn btn-soft" data-action="download-material" data-id="${escapeHtml(item.id)}">${icon('download')} Download</button></div>`);}
function showAssignmentSubmissions(id){const item=classData.assignments.find(assignment=>assignment.id===id);if(!item)return;const submissions=classData.submissions?.[id]||{};const rows=Object.entries(submissions).map(([studentId,submission])=>{const student=classData.users.find(user=>user.id===studentId);return `<div class="course-row"><div class="row-icon">${icon('clipboard')}</div><div class="list-row-main"><div class="course-title">${escapeHtml(student?.name||studentId)}</div><div class="course-caption">${escapeHtml(submission.fileName||'No file')} · ${formatDateTime(submission.submittedAt)}</div>${submission.note?`<div class="list-row-sub">${escapeHtml(submission.note)}</div>`:''}</div>${submission.dataUrl?`<button class="text-link" data-action="download-submission" data-assignment="${escapeHtml(id)}" data-student="${escapeHtml(studentId)}">Download</button>`:''}<button class="btn btn-soft small" data-action="grade-submission" data-assignment="${escapeHtml(id)}" data-student="${escapeHtml(studentId)}">${submission.grade!=null?'Edit grade':'Grade'}</button></div>`;}).join('');showModal('Submissions',item.title,rows||'<div class="empty-state">No students have submitted this assignment yet.</div>');}
function openGradeForm(assignmentId,studentId){const item=classData.assignments.find(assignment=>assignment.id===assignmentId);const submission=classData.submissions?.[assignmentId]?.[studentId];if(!item||!submission)return;showModal('Grade submission',`${item.title} · ${studentId}`,`<form id="grade-form" data-assignment="${escapeHtml(assignmentId)}" data-student="${escapeHtml(studentId)}"><div class="field"><label for="grade-score">Score (out of ${item.points||100})</label><input id="grade-score" type="number" min="0" max="${Number(item.points)||100}" step="0.5" value="${submission.grade??''}" required></div><div class="field"><label for="grade-feedback">Feedback</label><textarea id="grade-feedback" required placeholder="Give the student helpful feedback…">${escapeHtml(submission.feedback||'')}</textarea></div><div class="modal-actions"><button type="button" class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary">Save grade</button></div></form>`);}
function openFeedback(id){const submission=assignmentSubmission(id);const assignment=classData.assignments.find(item=>item.id===id);if(!submission||!assignment){toast('No teacher feedback is available yet.');return;}showModal('Teacher feedback',assignment.title,`<div class="stat-value" style="font-size:26px">${submission.grade??'Pending'}<span class="stat-trend"> / ${assignment.points||100}</span></div><div class="inline-note" style="margin-top:12px">${escapeHtml(submission.feedback||'Your teacher has not added feedback yet.')}</div>${submission.dataUrl?`<div class="modal-actions"><button class="btn btn-soft" data-action="download-submission" data-assignment="${escapeHtml(id)}" data-student="${escapeHtml(currentId())}">${icon('download')} Download your file</button></div>`:''}`);}
function openExamManager(id){const exam=classData.exams.find(item=>item.id===id);if(!exam)return;const results=classData.examResults?.[id]||{};const rows=Object.entries(results).map(([studentId,result])=>`<div class="course-row"><div class="list-row-main"><div class="course-title">${escapeHtml(classData.users.find(user=>user.id===studentId)?.name||studentId)}</div><div class="course-caption">${result.needsReview?'Needs descriptive grading':`Score ${result.score}/${result.total}`} · ${formatDateTime(result.completedAt)}</div></div>${result.needsReview?`<button class="btn btn-soft small" data-action="grade-exam" data-exam="${escapeHtml(id)}" data-student="${escapeHtml(studentId)}">Review</button>`:''}</div>`).join('');showModal('Manage exam',exam.title,`<div class="inline-note">${escapeHtml(exam.questions?.[0]?.prompt||'No question')}</div><div class="panel-sub" style="margin-top:12px">${Object.keys(results).length} submitted results</div>${rows||'<div class="empty-state">No student results yet.</div>'}<div class="modal-actions"><button class="btn btn-danger" data-action="delete-exam" data-id="${escapeHtml(id)}">${icon('close')} Delete exam</button></div>`);}
function openExamGradeForm(examId,studentId){const exam=classData.exams.find(item=>item.id===examId);const result=classData.examResults?.[examId]?.[studentId];const question=exam?.questions?.[0];if(!exam||!result||!question)return;showModal('Review descriptive answer',`${exam.title} · ${studentId}`,`<div class="field"><label>Student answer</label><div class="inline-note">${escapeHtml(result.answer||'No answer')}</div></div><form id="exam-grade-form" data-exam="${escapeHtml(examId)}" data-student="${escapeHtml(studentId)}"><div class="field"><label for="exam-grade-score">Score (out of ${question.points})</label><input id="exam-grade-score" type="number" min="0" max="${question.points}" step="0.5" required></div><div class="field"><label for="exam-grade-feedback">Feedback</label><textarea id="exam-grade-feedback" required></textarea></div><div class="modal-actions"><button type="button" class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary">Save review</button></div></form>`);}
function showExamResult(id){const result=classData.examResults?.[id]?.[currentId()];const exam=classData.exams.find(item=>item.id===id);if(!result||!exam)return;showModal('Exam result',exam.title,`<div class="stat-value" style="font-size:28px">${result.needsReview?'Pending teacher review':`${result.score}/${result.total}`}<span class="stat-trend">${result.needsReview?'':'score'}</span></div><div class="inline-note" style="margin-top:12px">${result.feedback?escapeHtml(result.feedback):'Your result is saved.'}</div>`);}
function openRoutineModal(){
  const owned=visibleCourses();if(!owned.length){toast('Create a class before adding a routine session.');return;}
  showModal('Add to your class routine','Students assigned to this class will see the session on their schedule.',`<form id="routine-form"><div class="field"><label for="routine-course">Class</label><select id="routine-course">${owned.map(course=>`<option value="${escapeHtml(course.id)}">${escapeHtml(course.title)}</option>`).join('')}</select></div><div class="field"><label for="routine-topic">Lesson or session</label><input id="routine-topic" required placeholder="Chapter, topic, or study session"></div><div class="field"><label for="routine-time">Date and time</label><input id="routine-time" type="datetime-local" required></div><div class="field"><label for="routine-duration">Length</label><select id="routine-duration"><option value="45">45 minutes</option><option value="50">50 minutes</option><option value="60" selected>60 minutes</option><option value="90">90 minutes</option></select></div><div class="field"><label for="routine-room">Room or note</label><input id="routine-room" value="Live class"></div><div class="modal-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn btn-primary">Share routine ${icon('arrow')}</button></div></form>`);
}
function openExamModal(){
  const owned=visibleCourses();if(!owned.length){toast('Create a class before assigning an exam.');return;}
  showModal('Create an exam','Add one MCQ or descriptive question for students in this class.',`<form id="teacher-exam-form"><div class="field"><label for="exam-title">Exam name</label><input id="exam-title" required placeholder="Chapter check-in"></div><div class="field"><label for="exam-course">Class</label><select id="exam-course">${owned.map(course=>`<option value="${escapeHtml(course.id)}">${escapeHtml(course.title)}</option>`).join('')}</select></div><div class="field"><label for="exam-date">Due date and time</label><input id="exam-date" type="datetime-local" required></div><div class="field"><label for="exam-duration">Time limit</label><select id="exam-duration"><option value="15">15 minutes</option><option value="20" selected>20 minutes</option><option value="30">30 minutes</option><option value="60">60 minutes</option></select></div><div class="field"><label for="exam-prompt">Question</label><textarea id="exam-prompt" required placeholder="Write the question…"></textarea></div><div class="field"><label for="exam-type">Question type</label><select id="exam-type"><option value="mcq">Multiple choice · auto-scored</option><option value="descriptive">Descriptive · teacher reviews</option></select></div><div id="exam-mcq-options"><div class="field"><label for="exam-choice-0">Choice 1</label><input id="exam-choice-0" placeholder="First answer" required></div><div class="field"><label for="exam-choice-1">Choice 2</label><input id="exam-choice-1" placeholder="Second answer" required></div><div class="field"><label for="exam-choice-2">Choice 3 (optional)</label><input id="exam-choice-2" placeholder="Third answer"></div><div class="field"><label for="exam-choice-3">Choice 4 (optional)</label><input id="exam-choice-3" placeholder="Fourth answer"></div><div class="field"><label for="exam-correct">Correct choice</label><select id="exam-correct"><option value="0">Choice 1</option><option value="1">Choice 2</option><option value="2">Choice 3</option><option value="3">Choice 4</option></select></div><div class="field"><label for="exam-negative">Negative marking (points)</label><input id="exam-negative" type="number" min="0" max="100" step="0.25" value="0"></div></div><div class="field"><label for="exam-points">Points</label><input id="exam-points" type="number" min="1" max="100" value="1" required></div><div class="modal-actions"><button type="button" class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary">Publish exam ${icon('arrow')}</button></div></form>`);
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
    try { const payload = JSON.parse(ev.data); if (payload.kind === 'chat') addMessage(payload.name || 'Classmate', payload.text, false); if (payload.kind === 'reaction') toast(`${payload.name || 'A classmate'} reacted ${payload.emoji}`); if(payload.kind==='whiteboard')applyWhiteboardMessage(payload); }
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
  live = { title, media:null, remoteStream:null, screenStream:null, peer:null, dataChannel:null, connected:false, cameraOn:false, micOn:false, raised:false, recording:false, messages:[], startedAt:null, timer:'00:00', whiteboardTool:'pen', whiteboardVisible:false, whiteboardOps:[] };
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
  const canvas=$('#whiteboard-canvas');if(!canvas)return;const ctx=canvas.getContext('2d');const resize=()=>{const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;const ratio=window.devicePixelRatio||1;canvas.width=rect.width*ratio;canvas.height=rect.height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.lineWidth=2.5;ctx.lineCap='round';ctx.strokeStyle='#178456';};resize();
  for(const operation of live?.whiteboardOps||[])drawWhiteboardOperation(operation,canvas,ctx);
  let drawing=false;const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)/Math.max(1,r.width),y:(e.clientY-r.top)/Math.max(1,r.height)};};
  canvas.onpointerdown=e=>{drawing=true;canvas.setPointerCapture(e.pointerId);const p=point(e);const operation={action:'start',...p,tool:live?.whiteboardTool||'pen'};applyWhiteboardMessage(operation);sendWhiteboard(operation);};
  canvas.onpointermove=e=>{if(!drawing)return;const p=point(e);const operation={action:'move',...p,tool:live?.whiteboardTool||'pen'};applyWhiteboardMessage(operation);sendWhiteboard(operation);};
  canvas.onpointerup=()=>{drawing=false;};canvas.onpointercancel=()=>{drawing=false;};
}
function sendWhiteboard(payload){if(live?.dataChannel?.readyState==='open')live.dataChannel.send(JSON.stringify({kind:'whiteboard',...payload}));}
function applyWhiteboardMessage(message){
  const canvas=$('#whiteboard-canvas');if(!canvas)return;const ctx=canvas.getContext('2d');
  if(message.action==='clear'){if(live)live.whiteboardOps=[];ctx.clearRect(0,0,canvas.width,canvas.height);return;}
  if(live)live.whiteboardOps.push(message);
  drawWhiteboardOperation(message,canvas,ctx);
}
function drawWhiteboardOperation(message,canvas,ctx){
  if(!canvas.clientWidth||!canvas.clientHeight)return;
  const x=Math.max(0,Math.min(1,Number(message.x)||0))*canvas.clientWidth;const y=Math.max(0,Math.min(1,Number(message.y)||0))*canvas.clientHeight;
  if(message.action==='start'){ctx.beginPath();ctx.moveTo(x,y);return;}
  if(message.action==='move'){const erasing=message.tool==='erase';ctx.strokeStyle=erasing?'#ffffff':'#178456';ctx.lineWidth=erasing?18:2.5;ctx.lineCap='round';ctx.lineTo(x,y);ctx.stroke();}
}
function makeLocalId(prefix){return `${prefix}-${Math.random().toString(36).slice(2,10).toUpperCase()}`;}
function addStudentToTeacher(studentId,courseIds){
  const normalized=String(studentId||'').replace(/\s+/g,'').toUpperCase();if(!/^AC-[A-Z0-9]+$/.test(normalized))throw new Error('Enter a valid Student ID beginning with AC-, for example AC-2048.');if(normalized===currentId())throw new Error('You cannot add your own account as a student.');
  let student=classData.users.find(user=>user.id.toUpperCase()===normalized&&user.role==='Student');const profilePending=!student;
  if(!student){student={id:normalized,name:`Student ${normalized.slice(-4)}`,role:'Student',email:'',profilePending:true};classData.users.push(student);}
  const roster=classData.rosters[currentId()]||(classData.rosters[currentId()]=[]);if(roster.some(id=>id.toUpperCase()===normalized))throw new Error('This student is already on your list.');roster.push(normalized);
  classData.enrollments[normalized]=classData.enrollments[normalized]||[];
  for(const courseId of courseIds){if(!classData.enrollments[normalized].includes(courseId))classData.enrollments[normalized].push(courseId);const course=allCourses().find(item=>item.id===courseId);if(course){course.studentIds=course.studentIds||[];if(!course.studentIds.includes(normalized))course.studentIds.push(normalized);}}
  const selected=new Set(courseIds);for(const item of [...classData.assignments,...classData.exams,...classData.routines])if(item.teacherId===currentId()&&selected.has(item.courseId)){item.assignedStudents=item.assignedStudents||[];if(!item.assignedStudents.includes(normalized))item.assignedStudents.push(normalized);}
  persistClassData();return {profilePending};
}
function removeStudentFromTeacher(studentId){
  classData.rosters[currentId()]=(classData.rosters[currentId()]||[]).filter(id=>id!==studentId);
  const owned=allCourses().filter(course=>course.teacherId===currentId());const courseIds=new Set(owned.map(course=>course.id));for(const course of owned)course.studentIds=(course.studentIds||[]).filter(id=>id!==studentId);
  classData.enrollments[studentId]=(classData.enrollments[studentId]||[]).filter(id=>!courseIds.has(id));
  for(const item of [...classData.assignments,...classData.exams,...classData.routines].filter(record=>record.teacherId===currentId()))item.assignedStudents=(item.assignedStudents||[]).filter(id=>id!==studentId);
  persistClassData();render();toast('Student removed from your classes.');
}
function stopLive() {
  if(!live)return;
  if(live.recorder?.state==='recording')live.recorder.stop();
  live.peer?.close();live.screenStream?.getTracks().forEach(t=>t.stop());live.media?.getTracks().forEach(t=>t.stop());
  clearTimeout(updateCallTime._timer);live=null;state.page='home';render();toast('You left the classroom.');
}

function openExam(exam){
  if(!exam)return;const question=exam.questions?.[0];if(!question){toast('This exam has no questions. Ask the teacher to edit it.');return;}
  let seconds=Math.max(1,Number(exam.duration)||20)*60;
  const answerMarkup=question.type==='descriptive'?`<textarea name="answer" required placeholder="Write your answer…"></textarea>`:(question.choices||[]).map((choice,index)=>`<label class="answer-choice"><input type="radio" name="answer" value="${index}" required> ${escapeHtml(choice)}</label>`).join('');
  showModal(exam.title,`${courseFor(exam.courseId)?.title||'Class'} · Your answer is saved in this browser.`,`<form id="exam-form" data-id="${escapeHtml(exam.id)}"><div class="exam-timer" id="exam-timer">${String(Math.floor(seconds/60)).padStart(2,'0')}:00 remaining</div><div class="exam-q">${escapeHtml(question.prompt)}</div>${answerMarkup}<div class="modal-actions"><button type="button" class="btn" data-action="close-modal">Save & exit</button><button class="btn btn-primary">Submit exam ${icon('arrow')}</button></div></form>`);
  clearInterval(openExam._interval);openExam._interval=setInterval(()=>{seconds--;const node=$('#exam-timer');if(!node){clearInterval(openExam._interval);return;}node.textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')} remaining`;if(seconds<=0){clearInterval(openExam._interval);toast('Time is up. Submitting your exam.');$('#exam-form')?.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));}},1000);
}

document.addEventListener('click', async event => {
  const pageButton=event.target.closest('[data-page]');if(pageButton){go(pageButton.dataset.page);return;}
  const button=event.target.closest('[data-action]');if(!button)return;const action=button.dataset.action;
  if(action==='close-modal'){if(event.target.classList.contains('modal-backdrop'))closeModal();else if(button.classList.contains('modal-close')||button.closest('.modal'))closeModal();return;}
  switch(action){
    case 'auth-google':window.dispatchEvent(new CustomEvent('aura-auth-request',{detail:{provider:'google'}}));break;
    case 'auth-facebook':window.dispatchEvent(new CustomEvent('aura-auth-request',{detail:{provider:'facebook'}}));break;
    case 'finish-onboarding':finishOnboarding(button.dataset.role);break;
    case 'cancel-onboarding':endSession();break;
    case 'sign-out':endSession();break;
    case 'open-profile':openUserProfile();break;
    case 'student-profile':{const student=classData.users.find(user=>user.id===button.dataset.id);if(student)openUserProfile(student);break;}
    case 'copy-profile-id':copyText(button.dataset.id||'').then(()=>toast('Profile ID copied.',true));break;
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
    case 'toggle-whiteboard':{const board=$('#whiteboard');live.whiteboardVisible=!board.classList.contains('visible');board.classList.toggle('visible',live.whiteboardVisible);if(live.whiteboardVisible)setupWhiteboard();break;}
    case 'toggle-recording':{if(!live?.media){toast('Join the class first to record.');break;}if(!window.MediaRecorder){toast('Recording is not supported in this browser.');break;}if(live.recording){live.recording=false;live.recorder.stop();renderCall();break;}try{const stream=new MediaStream([...live.media.getTracks()]);const chunks=[];const recorder=new MediaRecorder(stream);live.chunks=chunks;live.recorder=recorder;recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=()=>{downloadRecording(chunks,recorder);toast('Your local recording has been downloaded.',true);};recorder.start();live.recording=true;renderCall();toast('Recording started on this device.',true);}catch(err){toast(`Could not start recording: ${err.message}`);}break;}
    case 'call-reaction':showModal('Send a class reaction','Choose a quick reaction to share with everyone in the class.',`<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${['👏','👍','❤️','😂','🎉','✨','🤔','🙌'].map(emoji=>`<button class="btn" style="font-size:22px;width:48px;height:48px;padding:0" data-action="send-emoji" data-emoji="${emoji}">${emoji}</button>`).join('')}</div>`);break;
    case 'send-emoji':{const emoji=button.dataset.emoji;closeModal();if(live?.dataChannel?.readyState==='open'){live.dataChannel.send(JSON.stringify({kind:'reaction',name:state.user?.name||'Student',emoji}));toast(`Reaction sent ${emoji}`,true);}else toast('Join a peer first to share reactions.');break;}
    case 'toggle-bookmark':{const id=button.dataset.id;if(state.bookmarks.has(id)){state.bookmarks.delete(id);toast('Removed from bookmarks.');}else{state.bookmarks.add(id);toast('Saved to bookmarks.',true);}classData.bookmarks=classData.bookmarks||{};classData.bookmarks[currentId()]=[...state.bookmarks];persistClassData();render();break;}
    case 'download-material':{const item=(classData.materials||[]).find(resource=>resource.id===button.dataset.id);if(item)downloadFile(item.fileName,item.dataUrl);else toast('This file is not available.');break;}
    case 'upload-material':openUploadMaterialModal();break;
    case 'play-recording':openRecording((classData.materials||[]).find(item=>item.id===button.dataset.id));break;
    case 'submit-assignment':openSubmitAssignmentModal(button.dataset.id);break;
    case 'view-feedback':openFeedback(button.dataset.id);break;
    case 'start-exam':openExam(classData.exams.find(exam=>exam.id===button.dataset.id));break;
    case 'practice-exam':toast('Your teacher needs to publish an exam first.');break;
    case 'exam-result':showExamResult(button.dataset.id);break;
    case 'edit-exam':openExamManager(button.dataset.id);break;
    case 'delete-exam':{classData.exams=classData.exams.filter(exam=>exam.id!==button.dataset.id);delete classData.examResults?.[button.dataset.id];persistClassData();closeModal();render();toast('Exam deleted.',true);break;}
    case 'create-assignment':openCreateAssignmentModal();break;
    case 'view-submissions':showAssignmentSubmissions(button.dataset.id);break;
    case 'grade-submission':openGradeForm(button.dataset.assignment,button.dataset.student);break;
    case 'grade-exam':openExamGradeForm(button.dataset.exam,button.dataset.student);break;
    case 'download-submission':{const submission=classData.submissions?.[button.dataset.assignment]?.[button.dataset.student];if(submission)downloadFile(submission.fileName,submission.dataUrl);break;}    case 'schedule':go('schedule');break;
    case 'notifications':{const items=[...(classData.announcements||[]).slice(0,4).map(item=>({title:item.title,text:item.text,time:item.time||'Recently'})),...visibleRoutines().slice(0,3).map(item=>({title:`Class: ${item.title}`,text:`${item.sub} · ${item.time}`,time:item.date}))];showModal('Notifications','Recent class announcements and scheduled sessions.',items.map(item=>`<div class="announcement"><div class="announcement-head"><span class="live-pulse"></span><strong>${escapeHtml(item.title)}</strong><time>${escapeHtml(item.time)}</time></div><p>${escapeHtml(item.text)}</p></div>`).join('')||'<div class="empty-state">No new class updates.</div>');break;}
    case 'assignment-help':showModal('Assignment submissions','Submit a file before the deadline. Your teacher can review it and return a score and feedback.',`<div class="inline-note">Accepted files: image, PDF, or Word document. Files are kept in this browser until cloud storage is connected.</div>`);break;
    case 'new-discussion':{const teacher=state.role==='Teacher';showModal(teacher?'Post a class announcement':'Start a discussion',teacher?'Share an update with your class.':'Ask a question or share an idea with your class.',`<form id="discussion-form"><div class="field"><label for="discussion-title">${teacher?'Announcement title':'Topic'}</label><input id="discussion-title" required placeholder="${teacher?'Class update':'What would you like to discuss?'}"></div><div class="field"><label for="discussion-body">Message</label><textarea id="discussion-body" required placeholder="Add details…"></textarea></div><div class="modal-actions"><button type="button" class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary">${teacher?'Post announcement':'Post discussion'} ${icon('send')}</button></div></form>`);break;}
    case 'reminder-settings':case 'add-reminder':openReminderModal();break;
    case 'reminder-toggle':{const key=button.dataset.key;if(!key)break;const prefs=classData.reminders?.[currentId()]||{tenMinutes:true,oneHour:false};prefs[key]=!prefs[key];if(prefs[key]&&'Notification'in window&&Notification.permission==='default'){try{await Notification.requestPermission();}catch{}}if(prefs[key]&&(!('Notification'in window)||Notification.permission!=='granted')){prefs[key]=false;toast('Allow browser notifications to turn this reminder on.');}classData.reminders=classData.reminders||{};classData.reminders[currentId()]=prefs;persistClassData();scheduleBrowserReminders();button.classList.toggle('on',!!prefs[key]);break;}
    case 'help':showModal('Aura Class help','Find answers for your learning space.',`<div class="course-row"><div class="row-icon">${icon('video')}</div><div><div class="course-title">Joining a live class</div><div class="course-caption">Check camera, microphone, and network access</div></div></div><div class="course-row"><div class="row-icon blue">${icon('clipboard')}</div><div><div class="course-title">Submitting your work</div><div class="course-caption">Supported files and teacher feedback</div></div></div><div class="inline-note">For personalized support, ask your class administrator or instructor.</div>`);break;    case 'class-detail':{const c=visibleCourses()[Number(button.dataset.index)];if(!c)break;showModal(c.title,c.subtitle,`<div class="course-progress-card"><strong>${state.role==='Teacher'?'Class roster':'Course progress'} · ${state.role==='Teacher'?(classData.rosters[currentId()]||[]).length+' students':`${c.progress||0}%`}</strong><div class="progress-line"><span style="width:${c.progress||0}%"></span></div><small>Next up: ${c.next||'Set in your class routine'}</small></div><div class="course-row"><div class="row-icon">${icon('video')}</div><div><div class="course-title">${state.role==='Teacher'?'Start a live class':'Upcoming live class'}</div><div class="course-caption">${c.next||'See your schedule'} · ${c.duration||'Live session'}</div></div>${btn('start-class',state.role==='Teacher'?'Start class':'Join','video','btn-primary small',`data-title="${escapeHtml(c.title)} · ${escapeHtml(c.subtitle)}"`)}</div>${state.role==='Teacher'?`<div class="course-row"><div class="row-icon blue">${icon('users')}</div><div><div class="course-title">Students enrolled</div><div class="course-caption">${(classData.enrollments?Object.entries(classData.enrollments).filter(([,ids])=>ids.includes(c.id)).length:0)} students have access</div></div><button class="text-link" data-page="student-list">Manage list ${icon('arrow')}</button></div>`:`<div class="course-row"><div class="row-icon blue">${icon('book')}</div><div><div class="course-title">Course notes</div><div class="course-caption">Study materials shared by your teacher</div></div><button class="btn btn small" data-page="materials">${icon('arrow')} Open notes</button></div>`}`);break;}
    case 'search-recordings':go('recordings');setTimeout(()=>$('#global-search')?.focus(),20);break;
    default:toast('This action is ready to connect to your class service.');
  }
});

document.addEventListener('submit', async event => {
  const form=event.target;
  if(form.id==='join-form'){event.preventDefault();try{const offer=$('#class-code').value;const name=$('#join-name').value;closeModal();await connectAsGuest(offer,name);}catch(err){toast(err.message||'Please paste a valid class invite.');}return;}
  if(form.id==='create-form'){event.preventDefault();const title=$('#class-title').value.trim();const topic=$('#class-topic').value.trim();const dateTime=$('#class-time').value;const duration=Number($('#class-duration').value);const id=makeLocalId('CL');const teacherId=currentId();const roster=classData.rosters[teacherId]||[];const course={id,teacherId,studentIds:[...roster],title,subtitle:`${state.user?.name||'Teacher'} · ${topic}`,progress:0,code:title.slice(0,1).toUpperCase(),color:'',next:localDateLabel(dateTime),duration:`${duration} min`};classData.additionalCourses=classData.additionalCourses||[];classData.additionalCourses.push(course);for(const studentId of roster){classData.enrollments[studentId]=classData.enrollments[studentId]||[];if(!classData.enrollments[studentId].includes(id))classData.enrollments[studentId].push(id);}classData.routines.push({id:makeLocalId('RT'),courseId:id,teacherId,title,topic,date:dateTime.slice(0,10),time:dateTime.slice(11,16),duration,room:'Live class',assignedStudents:[...roster]});persistClassData();closeModal();state.page='classes';render();scheduleBrowserReminders();toast('Class and first routine session created.',true);return;}
  if(form.id==='add-student-form'){event.preventDefault();const id=$('#student-id-input').value.trim().toUpperCase();const selected=[...form.querySelectorAll('input[name="student-course"]:checked')].map(input=>input.value);try{const result=addStudentToTeacher(id,selected);closeModal();state.page='student-list';render();toast(result.profilePending?'ID added to this browser’s roster. Connect the Realtime Database to verify and sync the account across devices.':'Student added to your class list.',true);}catch(error){toast(error.message);}return;}
  if(form.id==='routine-form'){event.preventDefault();const courseId=$('#routine-course').value;const course=allCourses().find(item=>item.id===courseId);const dateTime=$('#routine-time').value;const roster=classData.rosters[currentId()]||[];classData.routines.push({id:makeLocalId('RT'),courseId,teacherId:currentId(),title:course?.title||'Class session',topic:$('#routine-topic').value.trim(),date:dateTime.slice(0,10),time:dateTime.slice(11,16),duration:Number($('#routine-duration').value),room:$('#routine-room').value.trim()||'Live class',assignedStudents:roster.filter(studentId=>(classData.enrollments[studentId]||[]).includes(courseId))});if(course)course.next=localDateLabel(dateTime);persistClassData();closeModal();state.page='schedule';render();scheduleBrowserReminders();toast('The routine is now visible to assigned students.',true);return;}
  if(form.id==='teacher-exam-form'){event.preventDefault();const courseId=$('#exam-course').value;const due=$('#exam-date').value;const dueDate=new Date(due);if(!Number.isFinite(dueDate.getTime())||dueDate.getTime()<=Date.now()){toast('Choose a future exam deadline.');return;}const students=(classData.rosters[currentId()]||[]).filter(studentId=>(classData.enrollments[studentId]||[]).includes(courseId));const type=$('#exam-type').value;const rawChoices=['#exam-choice-0','#exam-choice-1','#exam-choice-2','#exam-choice-3'].map(selector=>$(selector).value.trim());const choices=rawChoices.filter(Boolean);const correctValue=Number($('#exam-correct').value);if(type==='mcq'&&(choices.length<2||!rawChoices[correctValue])){toast('Add at least two choices and set a valid correct answer.');return;}const question={type,prompt:$('#exam-prompt').value.trim(),points:Number($('#exam-points').value)||1};if(type==='mcq'){question.choices=choices;question.correct=rawChoices.slice(0,correctValue+1).filter(Boolean).length-1;question.negativeMarking=Number($('#exam-negative').value)||0;}classData.exams.push({id:makeLocalId('EX'),teacherId:currentId(),courseId,title:$('#exam-title').value.trim(),detail:`1 question · ${$('#exam-duration').value} minutes`,dueAt:dueDate.toISOString(),date:due,duration:Number($('#exam-duration').value),assignedStudents:students,questions:[question]});persistClassData();closeModal();state.page='exams';render();toast(`Exam published for ${students.length} students.`,true);return;}
  if(form.id==='create-assignment-form'){event.preventDefault();const courseId=$('#assignment-course').value;const course=courseFor(courseId);const dueAt=$('#assignment-due').value;const dueDate=new Date(dueAt);if(!Number.isFinite(dueDate.getTime())||dueDate.getTime()<=Date.now()){toast('Choose a future assignment deadline.');return;}const students=(classData.rosters[currentId()]||[]).filter(studentId=>(classData.enrollments[studentId]||[]).includes(courseId));classData.assignments.push({id:makeLocalId('AS'),teacherId:currentId(),courseId,title:$('#assignment-title').value.trim(),instructions:$('#assignment-instructions').value.trim(),dueAt:dueDate.toISOString(),assignedStudents:students,points:100,createdAt:new Date().toISOString()});persistClassData();closeModal();state.page='assignments';render();toast(`Assignment published for ${students.length} students.`,true);return;}
  if(form.id==='material-form'){event.preventDefault();const file=$('#material-file').files[0];if(!file)return;if(file.size>1.5*1024*1024){toast('Choose a file smaller than 1.5 MB.');return;}try{const courseId=$('#material-course').value;const type=$('#material-type').value;const dataUrl=await readFileData(file);classData.materials.push({id:makeLocalId('RS'),teacherId:currentId(),courseId,title:$('#material-title').value.trim(),type:file.type.startsWith('video/')?'Recording':type,fileName:file.name,mimeType:file.type,dataUrl,createdAt:new Date().toISOString()});persistClassData();closeModal();render();toast('Resource shared with the class.',true);}catch(error){toast(error.name==='QuotaExceededError'?'Browser storage is full. Remove older resources or use cloud storage.':error.message||'Could not save the resource.');}return;}
  if(form.id==='chat-form'){event.preventDefault();const field=$('#chat-input');const text=field?.value.trim();if(text){addMessage(state.user?.name||'Classmate',text);field.value='';}return;}
  if(form.id==='submit-form'){event.preventDefault();const id=form.dataset.id;const file=$('#submission-file').files[0];if(file&&file.size>1.5*1024*1024){toast('Choose a file smaller than 1.5 MB.');return;}try{const old=assignmentSubmission(id);const dataUrl=file?await readFileData(file):old?.dataUrl;if(!dataUrl){toast('Choose a file before submitting.');return;}const assignment=classData.assignments.find(item=>item.id===id);classData.submissions=classData.submissions||{};classData.submissions[id]=classData.submissions[id]||{};classData.submissions[id][currentId()]={studentId:currentId(),fileName:file?.name||old.fileName,mimeType:file?.type||old.mimeType,dataUrl,note:$('#submission-note').value.trim(),submittedAt:new Date().toISOString(),grade:null,feedback:''};persistClassData();closeModal();render();toast('Your work was submitted.',true);}catch(error){toast(error.name==='QuotaExceededError'?'Browser storage is full. Use a smaller file.':error.message||'Could not submit your work.');}return;}
  if(form.id==='grade-form'){event.preventDefault();const {assignment:assignmentId,student:studentId}=form.dataset;const submission=classData.submissions?.[assignmentId]?.[studentId];const assignment=classData.assignments.find(item=>item.id===assignmentId);if(!submission||!assignment)return;const score=Number($('#grade-score').value);if(!Number.isFinite(score)||score<0||score>(assignment.points||100)){toast('Enter a score within the allowed range.');return;}submission.grade=score;submission.feedback=$('#grade-feedback').value.trim();submission.gradedAt=new Date().toISOString();persistClassData();closeModal();showAssignmentSubmissions(assignmentId);toast('Grade and feedback saved.',true);return;}
  if(form.id==='exam-grade-form'){event.preventDefault();const {exam:examId,student:studentId}=form.dataset;const exam=classData.exams.find(item=>item.id===examId);const result=classData.examResults?.[examId]?.[studentId];const max=exam?.questions?.[0]?.points||0;const score=Number($('#exam-grade-score').value);if(!result||!Number.isFinite(score)||score<0||score>max){toast('Enter a score within the allowed range.');return;}result.score=score;result.needsReview=false;result.feedback=$('#exam-grade-feedback').value.trim();result.gradedAt=new Date().toISOString();persistClassData();openExamManager(examId);toast('Descriptive exam graded.',true);return;}
  if(form.id==='exam-form'){event.preventDefault();const exam=classData.exams.find(item=>item.id===form.dataset.id);const question=exam?.questions?.[0];if(!exam||!question)return;const answer=new FormData(form).get('answer');let score=null;let needsReview=question.type==='descriptive';if(!needsReview){score=Number(answer)===question.correct?question.points:Math.max(0,question.points-(question.negativeMarking||0));}classData.examResults=classData.examResults||{};classData.examResults[exam.id]=classData.examResults[exam.id]||{};classData.examResults[exam.id][currentId()]={answer,score,total:question.points,needsReview,completedAt:new Date().toISOString()};persistClassData();clearInterval(openExam._interval);closeModal();state.page='exams';render();toast(needsReview?'Exam submitted for teacher review.':`Exam submitted · ${score}/${question.points}`,true);return;}
  if(form.id==='discussion-form'){event.preventDefault();const title=$('#discussion-title').value.trim();const text=$('#discussion-body').value.trim();const post={id:makeLocalId('PO'),author:state.user?.name||'Aura Class user',role:state.role,title,text,initials:(state.user?.name||'AC').split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase(),time:new Date().toLocaleString(),createdAt:new Date().toISOString()};if(state.role==='Teacher')classData.announcements.unshift(post);else classData.discussions.unshift(post);persistClassData();closeModal();state.page='community';render();toast('Your post was published.',true);return;}
  if(form.id==='invite-form'){event.preventDefault();const inviteEmail=$('#invite-email')?.value||'your new user';closeModal();toast(`Invitation created for ${inviteEmail}.`,true);return;}
});

document.addEventListener('click', event => {
  const tool=event.target.closest('[data-tool]');if(tool){const board=$('#whiteboard-canvas');if(tool.dataset.tool==='clear'){if(board)board.getContext('2d').clearRect(0,0,board.width,board.height);sendWhiteboard({action:'clear'});return;}if(live)live.whiteboardTool=tool.dataset.tool;document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b===tool));}
});
document.addEventListener('change',event=>{
  if(event.target.id==='exam-type'){const isMcq=event.target.value==='mcq';const options=$('#exam-mcq-options');if(options)options.hidden=!isMcq;for(let index=0;index<4;index++){const input=$(`#exam-choice-${index}`);if(input)input.required=isMcq&&index<2;}}
  if(event.target.id==='recording-speed'){const player=$('#recording-player');if(player)player.playbackRate=Number(event.target.value)||1;}
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal();});

render();
