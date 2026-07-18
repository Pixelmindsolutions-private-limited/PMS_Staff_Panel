// import React, { useState } from 'react';
// import {
//   FiUser, FiMail, FiPhone, FiMapPin, FiCalendar,
//   FiBriefcase, FiDollarSign, FiAward, FiEdit3,
//   FiSave, FiX, FiShield, FiStar, FiActivity
// } from 'react-icons/fi';

// const style = `
//   @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

//   :root {
//     --t50:#f0fdfa;--t100:#ccfbf1;--t200:#99f6e4;--t300:#5eead4;--t400:#2dd4bf;
//     --t500:#14b8a6;--t600:#0d9488;--t700:#0f766e;--t800:#115e59;
//     --s400:#94a3b8;--s500:#64748b;--s600:#475569;--s700:#334155;--s800:#1e293b;
//     --sur:#ffffff;--sur2:#f8fffe;
//     --rsm:8px;--rmd:14px;--rlg:20px;
//     --shmd:0 4px 16px rgba(13,148,136,.10),0 2px 6px rgba(13,148,136,.06);
//     --shlg:0 10px 40px rgba(13,148,136,.14),0 4px 12px rgba(13,148,136,.08);
//     --glow:0 0 0 3px rgba(20,184,166,.18);
//   }
//   *{box-sizing:border-box;}

//   .prof-root {
//     font-family:'DM Sans',sans-serif;
//     min-height:100vh;
//     background:linear-gradient(135deg,#f0fdfa 0%,#e6faf7 40%,#f0fdf9 70%,#ecfdf5 100%);
//     position:relative;overflow-x:hidden;
//     padding:20px 14px 64px;
//   }
//   @media(min-width:480px){.prof-root{padding:24px 18px 64px;}}
//   @media(min-width:640px){.prof-root{padding:32px 24px 72px;}}
//   @media(min-width:1024px){.prof-root{padding:40px 40px 80px;}}

//   .prof-root::before{content:'';position:fixed;top:-180px;right:-180px;width:540px;height:540px;
//     background:radial-gradient(circle,rgba(20,184,166,.09) 0%,transparent 70%);pointer-events:none;z-index:0;}
//   .prof-root::after{content:'';position:fixed;bottom:-140px;left:-140px;width:460px;height:460px;
//     background:radial-gradient(circle,rgba(13,148,136,.07) 0%,transparent 70%);pointer-events:none;z-index:0;}

//   .prof-inner{position:relative;z-index:1;max-width:1100px;margin:0 auto;}

//   /* ── Page header ── */
//   .page-hdr{display:flex;flex-direction:column;gap:14px;margin-bottom:28px;}
//   @media(min-width:600px){.page-hdr{flex-direction:row;align-items:flex-start;justify-content:space-between;}}
//   .page-title{font-family:'Syne',sans-serif;font-size:clamp(20px,4vw,28px);font-weight:800;
//     color:var(--t800);letter-spacing:-.5px;margin:0 0 3px;}
//   .page-sub{font-size:13px;color:var(--s500);margin:0;}
//   .hdr-btns{display:flex;gap:9px;flex-wrap:wrap;align-items:flex-start;}

//   .btn-edit{display:inline-flex;align-items:center;gap:7px;
//     background:linear-gradient(135deg,var(--t500),var(--t600));color:#fff;
//     border:none;border-radius:var(--rmd);padding:10px 18px;
//     font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;
//     transition:all .2s;box-shadow:0 4px 14px rgba(13,148,136,.28);white-space:nowrap;}
//   .btn-edit:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(13,148,136,.38);}
//   .btn-save{display:inline-flex;align-items:center;gap:7px;
//     background:linear-gradient(135deg,var(--t500),var(--t600));color:#fff;
//     border:none;border-radius:var(--rmd);padding:10px 18px;
//     font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;
//     transition:all .2s;box-shadow:0 4px 14px rgba(13,148,136,.28);white-space:nowrap;}
//   .btn-save:hover{transform:translateY(-1px);}
//   .btn-cancel{display:inline-flex;align-items:center;gap:7px;
//     background:var(--sur);color:var(--t700);border:1.5px solid var(--t200);
//     border-radius:var(--rmd);padding:9px 16px;
//     font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;
//     transition:all .2s;white-space:nowrap;}
//   .btn-cancel:hover{background:var(--t50);}

//   /* ── Layout grid ── */
//   .layout-grid{display:grid;grid-template-columns:1fr;gap:18px;}
//   @media(min-width:1024px){.layout-grid{grid-template-columns:280px 1fr;gap:22px;align-items:start;}}

//   /* ── Card ── */
//   .card{background:var(--sur);border-radius:var(--rlg);box-shadow:var(--shmd);
//     border:1px solid rgba(20,184,166,.12);padding:20px;}
//   @media(min-width:480px){.card{padding:22px 24px;}}

//   /* ── Profile sidebar ── */
//   .profile-card{position:sticky;top:24px;}

//   .avatar-section{display:flex;flex-direction:column;align-items:center;text-align:center;
//     padding-bottom:18px;margin-bottom:18px;border-bottom:1px solid var(--t100);}
//   .avatar{width:80px;height:80px;border-radius:20px;
//     background:linear-gradient(135deg,var(--t400),var(--t700));
//     display:flex;align-items:center;justify-content:center;
//     color:#fff;font-family:'Syne',sans-serif;font-size:26px;font-weight:800;
//     margin-bottom:12px;box-shadow:0 6px 20px rgba(13,148,136,.30);}
//   @media(min-width:480px){.avatar{width:92px;height:92px;font-size:30px;}}
//   .profile-name{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;
//     color:var(--t800);margin:0 0 3px;}
//   .profile-role{font-size:12px;color:var(--s500);margin:0 0 8px;}
//   .dept-chip{display:inline-block;background:var(--t50);color:var(--t700);
//     border:1px solid var(--t200);border-radius:20px;font-size:10px;font-weight:700;padding:3px 11px;}

//   /* Quick stats */
//   .quick-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}
//   .qs-tile{display:flex;flex-direction:column;align-items:center;padding:11px 8px;
//     background:var(--t50);border:1px solid var(--t100);border-radius:var(--rmd);transition:all .2s;}
//   .qs-tile:hover{transform:translateY(-2px);box-shadow:var(--shmd);}
//   .qs-icon{font-size:15px;color:var(--t500);margin-bottom:4px;}
//   .qs-label{font-size:9px;color:var(--s400);font-weight:600;text-transform:uppercase;
//     letter-spacing:.04em;margin-bottom:2px;}
//   .qs-val{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:var(--t800);}

//   /* Employee ID */
//   .emp-id-chip{background:var(--t50);border:1px solid var(--t100);border-radius:var(--rmd);
//     padding:10px;text-align:center;margin-bottom:14px;}
//   .emp-id-label{font-size:9px;color:var(--s400);font-weight:700;text-transform:uppercase;
//     letter-spacing:.06em;margin-bottom:2px;}
//   .emp-id-val{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;color:var(--t700);}

//   /* Contact items */
//   .contact-list{display:flex;flex-direction:column;gap:9px;}
//   .contact-item{display:flex;align-items:center;gap:9px;font-size:11px;color:var(--t700);}
//   .contact-icon-wrap{width:26px;height:26px;border-radius:7px;
//     background:var(--t50);border:1px solid var(--t100);
//     display:flex;align-items:center;justify-content:center;color:var(--t500);font-size:11px;flex-shrink:0;}
//   .contact-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;}

//   /* ── Right detail stack ── */
//   .detail-stack{display:flex;flex-direction:column;gap:16px;}

//   /* ── Section header ── */
//   .section-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
//   .section-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;
//     color:var(--t800);display:flex;align-items:center;gap:8px;margin:0;}
//   .section-icon{width:28px;height:28px;border-radius:8px;
//     background:linear-gradient(135deg,var(--t100),var(--t200));
//     display:flex;align-items:center;justify-content:center;color:var(--t600);font-size:12px;}
//   .active-badge{display:inline-flex;align-items:center;gap:5px;
//     font-size:10px;font-weight:700;color:#059669;
//     background:#ecfdf5;border:1px solid #a7f3d0;border-radius:20px;padding:3px 10px;}
//   .pulse-dot{width:6px;height:6px;border-radius:50%;background:#34d399;animation:pulse 1.5s ease-in-out infinite;}
//   @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}

//   /* ── Fields grid ── */
//   .fields-grid{display:grid;grid-template-columns:1fr;gap:14px;}
//   @media(min-width:480px){.fields-grid{grid-template-columns:1fr 1fr;gap:16px;}}

//   .field-wrap{}
//   .field-label{display:block;font-size:10px;font-weight:700;color:var(--t500);
//     text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;}
//   .field-val{display:flex;align-items:center;gap:7px;}
//   .field-icon{color:var(--t300);font-size:13px;flex-shrink:0;}
//   .field-text{font-size:13px;font-weight:700;color:var(--t800);}

//   /* Edit inputs */
//   .edit-input-wrap{position:relative;}
//   .edit-input-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);
//     color:var(--t400);font-size:13px;pointer-events:none;}
//   .edit-input{width:100%;padding:10px 13px;border:1.5px solid var(--t100);border-radius:var(--rsm);
//     font-family:'DM Sans',sans-serif;font-size:13px;color:var(--t800);
//     background:var(--t50);outline:none;transition:all .2s;}
//   .edit-input:focus{border-color:var(--t400);box-shadow:var(--glow);background:#fff;}
//   .edit-input-has-icon{padding-left:36px;}
//   textarea.edit-input{resize:none;padding-top:10px;}

//   /* Col span helper */
//   .col-span-2{grid-column:1/-1;}

//   /* ── Bottom row: skills + employment ── */
//   .bottom-row{display:grid;grid-template-columns:1fr;gap:16px;}
//   @media(min-width:640px){.bottom-row{grid-template-columns:1fr 1fr;}}

//   /* Skills */
//   .skills-wrap{display:flex;flex-wrap:wrap;gap:7px;}
//   .skill-tag{padding:5px 12px;background:var(--t50);color:var(--t700);
//     border:1px solid var(--t200);border-radius:20px;font-size:11px;font-weight:700;
//     transition:all .15s;cursor:default;}
//   .skill-tag:hover{background:var(--t100);}

//   /* Employment rows */
//   .emp-row{display:flex;align-items:center;justify-content:space-between;
//     padding:9px 0;border-bottom:1px solid var(--t50);}
//   .emp-row:last-child{border-bottom:none;}
//   .emp-key{font-size:11px;color:var(--s500);font-weight:500;}
//   .emp-val{font-size:12px;font-weight:800;color:var(--t700);}
//   .emp-val-accent{font-size:13px;font-weight:800;color:var(--t600);}
// `;

// const StaffMyProfile = () => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [profileData, setProfileData] = useState({
//     personal: {
//       name: 'Raj Sharma',
//       employeeId: 'EMP001',
//       email: 'raj.sharma@company.com',
//       phone: '+91-9876543210',
//       address: '123 Main Street, Mumbai, Maharashtra - 400001',
//       dateOfBirth: '1990-05-15',
//       gender: 'Male',
//       bloodGroup: 'B+',
//     },
//     professional: {
//       department: 'Sales',
//       position: 'Senior Executive',
//       manager: 'Priya Patel',
//       joinDate: '2022-01-15',
//       workSchedule: 'Mon-Fri, 9:00 AM – 6:00 PM',
//       employeeType: 'Full Time',
//       workLocation: 'Mumbai Office',
//     },
//     employment: {
//       salary: 67000,
//       bankAccount: 'XXXX XXXX 1234',
//       pfNumber: 'PF/2022/001',
//       uanNumber: '123456789012',
//       insuranceNumber: 'INS-456789',
//     },
//     skills: ['Sales Strategy', 'Client Management', 'CRM Software', 'Team Leadership', 'Market Analysis'],
//   });

//   const handleSave = () => { setIsEditing(false); alert('Profile updated!'); };
//   const handleCancel = () => setIsEditing(false);
//   const handleChange = (section, field, value) =>
//     setProfileData(p => ({ ...p, [section]: { ...p[section], [field]: value } }));

//   const initials = profileData.personal.name.split(' ').map(n => n[0]).join('');

//   /* ── Field component ── */
//   const Field = ({ label, value, section, fieldKey, type = 'text', icon }) => (
//     <div className="field-wrap">
//       <label className="field-label">{label}</label>
//       {isEditing && section ? (
//         <div className="edit-input-wrap">
//           {icon && <span className="edit-input-icon">{icon}</span>}
//           {type === 'textarea' ? (
//             <textarea rows={3}
//               className={`edit-input${icon ? ' edit-input-has-icon' : ''}`}
//               value={value}
//               onChange={e => handleChange(section, fieldKey, e.target.value)}/>
//           ) : (
//             <input type={type}
//               className={`edit-input${icon ? ' edit-input-has-icon' : ''}`}
//               value={value}
//               onChange={e => handleChange(section, fieldKey, e.target.value)}/>
//           )}
//         </div>
//       ) : (
//         <div className="field-val">
//           {icon && <span className="field-icon">{icon}</span>}
//           <span className="field-text">{value}</span>
//         </div>
//       )}
//     </div>
//   );

//   /* ── Read-only field ── */
//   const ReadField = ({ label, value, icon }) => (
//     <div className="field-wrap">
//       <label className="field-label">{label}</label>
//       <div className="field-val">
//         {icon && <span className="field-icon">{icon}</span>}
//         <span className="field-text">{value}</span>
//       </div>
//     </div>
//   );

//   /* ── Section card ── */
//   const Section = ({ icon, title, badge, children, className = '' }) => (
//     <div className={`card ${className}`}>
//       <div className="section-hdr">
//         <h3 className="section-title">
//           <span className="section-icon">{icon}</span>
//           {title}
//         </h3>
//         {badge}
//       </div>
//       {children}
//     </div>
//   );

//   return (
//     <div className="prof-root">
//       <style>{style}</style>
//       <div className="prof-inner">

//         {/* Page header */}
//         <div className="page-hdr">
//           <div>
//             <h1 className="page-title">My Profile</h1>
//             <p className="page-sub">Manage your personal and professional information</p>
//           </div>
//           <div className="hdr-btns">
//             {!isEditing ? (
//               <button className="btn-edit" onClick={() => setIsEditing(true)}>
//                 <FiEdit3 style={{fontSize:14}}/>Edit Profile
//               </button>
//             ) : (
//               <>
//                 <button className="btn-save" onClick={handleSave}>
//                   <FiSave style={{fontSize:14}}/>Save Changes
//                 </button>
//                 <button className="btn-cancel" onClick={handleCancel}>
//                   <FiX style={{fontSize:14}}/>Cancel
//                 </button>
//               </>
//             )}
//           </div>
//         </div>

//         <div className="layout-grid">

//           {/* ── Profile sidebar ── */}
//           <div>
//             <div className="card profile-card">
//               {/* Avatar */}
//               <div className="avatar-section">
//                 <div className="avatar">{initials}</div>
//                 <p className="profile-name">{profileData.personal.name}</p>
//                 <p className="profile-role">{profileData.professional.position}</p>
//                 <span className="dept-chip">{profileData.professional.department}</span>
//               </div>

//               {/* Quick stats */}
//               <div className="quick-stats">
//                 <div className="qs-tile">
//                   <FiAward className="qs-icon"/>
//                   <span className="qs-label">Performance</span>
//                   <span className="qs-val">92%</span>
//                 </div>
//                 <div className="qs-tile">
//                   <FiActivity className="qs-icon"/>
//                   <span className="qs-label">Attendance</span>
//                   <span className="qs-val">95%</span>
//                 </div>
//               </div>

//               {/* Employee ID */}
//               <div className="emp-id-chip">
//                 <div className="emp-id-label">Employee ID</div>
//                 <div className="emp-id-val">{profileData.personal.employeeId}</div>
//               </div>

//               {/* Contact info */}
//               <div className="contact-list">
//                 {[
//                   { icon: <FiMail />,   text: profileData.personal.email           },
//                   { icon: <FiPhone />,  text: profileData.personal.phone           },
//                   { icon: <FiMapPin />, text: profileData.professional.workLocation },
//                 ].map((item, i) => (
//                   <div key={i} className="contact-item">
//                     <div className="contact-icon-wrap">{item.icon}</div>
//                     <span className="contact-text">{item.text}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* ── Detail sections ── */}
//           <div className="detail-stack">

//             {/* Personal */}
//             <Section
//               icon={<FiUser style={{fontSize:12}}/>}
//               title="Personal Information"
//               badge={
//                 <div className="active-badge">
//                   <div className="pulse-dot"/>Active
//                 </div>
//               }
//             >
//               <div className="fields-grid">
//                 <Field label="Full Name"     value={profileData.personal.name}        section="personal" fieldKey="name" />
//                 <Field label="Email"         value={profileData.personal.email}       section="personal" fieldKey="email"       type="email" icon={<FiMail />} />
//                 <Field label="Phone"         value={profileData.personal.phone}       section="personal" fieldKey="phone"       type="tel"   icon={<FiPhone />} />
//                 <Field label="Date of Birth" value={profileData.personal.dateOfBirth} section="personal" fieldKey="dateOfBirth" type="date" />
//                 <ReadField label="Gender"      value={profileData.personal.gender} />
//                 <ReadField label="Blood Group" value={profileData.personal.bloodGroup} icon={<FiShield />} />
//                 <div className="col-span-2">
//                   <Field label="Address" value={profileData.personal.address} section="personal" fieldKey="address" type="textarea" icon={<FiMapPin />} />
//                 </div>
//               </div>
//             </Section>

//             {/* Professional */}
//             <Section icon={<FiBriefcase style={{fontSize:12}}/>} title="Professional Information">
//               <div className="fields-grid">
//                 <ReadField label="Department"      value={profileData.professional.department} />
//                 <ReadField label="Position"        value={profileData.professional.position} />
//                 <ReadField label="Manager"         value={profileData.professional.manager}       icon={<FiUser />} />
//                 <ReadField label="Join Date"       value={profileData.professional.joinDate}      icon={<FiCalendar />} />
//                 <ReadField label="Work Schedule"   value={profileData.professional.workSchedule} />
//                 <ReadField label="Employment Type" value={profileData.professional.employeeType} />
//                 <ReadField label="Work Location"   value={profileData.professional.workLocation}  icon={<FiMapPin />} />
//               </div>
//             </Section>

//             {/* Skills + Employment */}
//             <div className="bottom-row">

//               <Section icon={<FiStar style={{fontSize:12}}/>} title="Skills & Expertise">
//                 <div className="skills-wrap">
//                   {profileData.skills.map((s, i) => (
//                     <span key={i} className="skill-tag">{s}</span>
//                   ))}
//                 </div>
//               </Section>

//               <Section icon={<FiDollarSign style={{fontSize:12}}/>} title="Employment Details">
//                 {[
//                   { label:'Monthly Salary',  value:`₹${profileData.employment.salary.toLocaleString()}`, accent:true },
//                   { label:'Bank Account',    value:profileData.employment.bankAccount },
//                   { label:'PF Number',       value:profileData.employment.pfNumber },
//                   { label:'UAN Number',      value:profileData.employment.uanNumber },
//                   { label:'Insurance No.',   value:profileData.employment.insuranceNumber },
//                 ].map((row, i) => (
//                   <div key={i} className="emp-row">
//                     <span className="emp-key">{row.label}</span>
//                     <span className={row.accent ? 'emp-val-accent' : 'emp-val'}>{row.value}</span>
//                   </div>
//                 ))}
//               </Section>

//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StaffMyProfile;



import React, { useState, useEffect } from 'react';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiCalendar,
  FiBriefcase, FiDollarSign, FiAward, FiEdit3,
  FiSave, FiX, FiShield, FiStar, FiActivity, FiLoader
} from 'react-icons/fi';

const style = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

  :root {
    --t50:#f0fdfa;--t100:#ccfbf1;--t200:#99f6e4;--t300:#5eead4;--t400:#2dd4bf;
    --t500:#14b8a6;--t600:#0d9488;--t700:#0f766e;--t800:#115e59;
    --s400:#94a3b8;--s500:#64748b;--s600:#475569;--s700:#334155;--s800:#1e293b;
    --sur:#ffffff;--sur2:#f8fffe;
    --rsm:8px;--rmd:14px;--rlg:20px;
    --shmd:0 4px 16px rgba(13,148,136,.10),0 2px 6px rgba(13,148,136,.06);
    --shlg:0 10px 40px rgba(13,148,136,.14),0 4px 12px rgba(13,148,136,.08);
    --glow:0 0 0 3px rgba(20,184,166,.18);
  }
  *{box-sizing:border-box;}

  .prof-root {
    font-family:'DM Sans',sans-serif;
    min-height:100vh;
    background:linear-gradient(135deg,#f0fdfa 0%,#e6faf7 40%,#f0fdf9 70%,#ecfdf5 100%);
    position:relative;overflow-x:hidden;
    padding:20px 14px 64px;
  }
  @media(min-width:480px){.prof-root{padding:24px 18px 64px;}}
  @media(min-width:640px){.prof-root{padding:32px 24px 72px;}}
  @media(min-width:1024px){.prof-root{padding:40px 40px 80px;}}

  .prof-root::before{content:'';position:fixed;top:-180px;right:-180px;width:540px;height:540px;
    background:radial-gradient(circle,rgba(20,184,166,.09) 0%,transparent 70%);pointer-events:none;z-index:0;}
  .prof-root::after{content:'';position:fixed;bottom:-140px;left:-140px;width:460px;height:460px;
    background:radial-gradient(circle,rgba(13,148,136,.07) 0%,transparent 70%);pointer-events:none;z-index:0;}

  .prof-inner{position:relative;z-index:1;max-width:1100px;margin:0 auto;}

  /* ── Page header ── */
  .page-hdr{display:flex;flex-direction:column;gap:14px;margin-bottom:28px;}
  @media(min-width:600px){.page-hdr{flex-direction:row;align-items:flex-start;justify-content:space-between;}}
  .page-title{font-family:'Syne',sans-serif;font-size:clamp(20px,4vw,28px);font-weight:800;
    color:var(--t800);letter-spacing:-.5px;margin:0 0 3px;}
  .page-sub{font-size:13px;color:var(--s500);margin:0;}
  .hdr-btns{display:flex;gap:9px;flex-wrap:wrap;align-items:flex-start;}

  .btn-edit{display:inline-flex;align-items:center;gap:7px;
    background:linear-gradient(135deg,var(--t500),var(--t600));color:#fff;
    border:none;border-radius:var(--rmd);padding:10px 18px;
    font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;
    transition:all .2s;box-shadow:0 4px 14px rgba(13,148,136,.28);white-space:nowrap;}
  .btn-edit:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(13,148,136,.38);}
  .btn-save{display:inline-flex;align-items:center;gap:7px;
    background:linear-gradient(135deg,var(--t500),var(--t600));color:#fff;
    border:none;border-radius:var(--rmd);padding:10px 18px;
    font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;
    transition:all .2s;box-shadow:0 4px 14px rgba(13,148,136,.28);white-space:nowrap;}
  .btn-save:hover{transform:translateY(-1px);}
  .btn-cancel{display:inline-flex;align-items:center;gap:7px;
    background:var(--sur);color:var(--t700);border:1.5px solid var(--t200);
    border-radius:var(--rmd);padding:9px 16px;
    font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;
    transition:all .2s;white-space:nowrap;}
  .btn-cancel:hover{background:var(--t50);}

  /* ── Layout grid ── */
  .layout-grid{display:grid;grid-template-columns:1fr;gap:18px;}
  @media(min-width:1024px){.layout-grid{grid-template-columns:280px 1fr;gap:22px;align-items:start;}}

  /* ── Card ── */
  .card{background:var(--sur);border-radius:var(--rlg);box-shadow:var(--shmd);
    border:1px solid rgba(20,184,166,.12);padding:20px;}
  @media(min-width:480px){.card{padding:22px 24px;}}

  /* ── Profile sidebar ── */
  .profile-card{position:sticky;top:24px;}

  .avatar-section{display:flex;flex-direction:column;align-items:center;text-align:center;
    padding-bottom:18px;margin-bottom:18px;border-bottom:1px solid var(--t100);}
  .avatar{width:80px;height:80px;border-radius:20px;
    background:linear-gradient(135deg,var(--t400),var(--t700));
    display:flex;align-items:center;justify-content:center;
    color:#fff;font-family:'Syne',sans-serif;font-size:26px;font-weight:800;
    margin-bottom:12px;box-shadow:0 6px 20px rgba(13,148,136,.30);}
  @media(min-width:480px){.avatar{width:92px;height:92px;font-size:30px;}}
  .profile-name{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;
    color:var(--t800);margin:0 0 3px;}
  .profile-role{font-size:12px;color:var(--s500);margin:0 0 8px;}
  .dept-chip{display:inline-block;background:var(--t50);color:var(--t700);
    border:1px solid var(--t200);border-radius:20px;font-size:10px;font-weight:700;padding:3px 11px;}

  /* Quick stats */
  .quick-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}
  .qs-tile{display:flex;flex-direction:column;align-items:center;padding:11px 8px;
    background:var(--t50);border:1px solid var(--t100);border-radius:var(--rmd);transition:all .2s;}
  .qs-tile:hover{transform:translateY(-2px);box-shadow:var(--shmd);}
  .qs-icon{font-size:15px;color:var(--t500);margin-bottom:4px;}
  .qs-label{font-size:9px;color:var(--s400);font-weight:600;text-transform:uppercase;
    letter-spacing:.04em;margin-bottom:2px;}
  .qs-val{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:var(--t800);}

  /* Employee ID */
  .emp-id-chip{background:var(--t50);border:1px solid var(--t100);border-radius:var(--rmd);
    padding:10px;text-align:center;margin-bottom:14px;}
  .emp-id-label{font-size:9px;color:var(--s400);font-weight:700;text-transform:uppercase;
    letter-spacing:.06em;margin-bottom:2px;}
  .emp-id-val{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;color:var(--t700);}

  /* Contact items */
  .contact-list{display:flex;flex-direction:column;gap:9px;}
  .contact-item{display:flex;align-items:center;gap:9px;font-size:11px;color:var(--t700);}
  .contact-icon-wrap{width:26px;height:26px;border-radius:7px;
    background:var(--t50);border:1px solid var(--t100);
    display:flex;align-items:center;justify-content:center;color:var(--t500);font-size:11px;flex-shrink:0;}
  .contact-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;}

  /* ── Right detail stack ── */
  .detail-stack{display:flex;flex-direction:column;gap:16px;}

  /* ── Section header ── */
  .section-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
  .section-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;
    color:var(--t800);display:flex;align-items:center;gap:8px;margin:0;}
  .section-icon{width:28px;height:28px;border-radius:8px;
    background:linear-gradient(135deg,var(--t100),var(--t200));
    display:flex;align-items:center;justify-content:center;color:var(--t600);font-size:12px;}
  .active-badge{display:inline-flex;align-items:center;gap:5px;
    font-size:10px;font-weight:700;color:#059669;
    background:#ecfdf5;border:1px solid #a7f3d0;border-radius:20px;padding:3px 10px;}
  .pulse-dot{width:6px;height:6px;border-radius:50%;background:#34d399;animation:pulse 1.5s ease-in-out infinite;}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}

  /* ── Fields grid ── */
  .fields-grid{display:grid;grid-template-columns:1fr;gap:14px;}
  @media(min-width:480px){.fields-grid{grid-template-columns:1fr 1fr;gap:16px;}}

  .field-wrap{}
  .field-label{display:block;font-size:10px;font-weight:700;color:var(--t500);
    text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;}
  .field-val{display:flex;align-items:center;gap:7px;}
  .field-icon{color:var(--t300);font-size:13px;flex-shrink:0;}
  .field-text{font-size:13px;font-weight:700;color:var(--t800);}

  /* Edit inputs */
  .edit-input-wrap{position:relative;}
  .edit-input-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);
    color:var(--t400);font-size:13px;pointer-events:none;}
  .edit-input{width:100%;padding:10px 13px;border:1.5px solid var(--t100);border-radius:var(--rsm);
    font-family:'DM Sans',sans-serif;font-size:13px;color:var(--t800);
    background:var(--t50);outline:none;transition:all .2s;}
  .edit-input:focus{border-color:var(--t400);box-shadow:var(--glow);background:#fff;}
  .edit-input-has-icon{padding-left:36px;}
  textarea.edit-input{resize:none;padding-top:10px;}

  /* Col span helper */
  .col-span-2{grid-column:1/-1;}

  /* ── Bottom row: skills + employment ── */
  .bottom-row{display:grid;grid-template-columns:1fr;gap:16px;}
  @media(min-width:640px){.bottom-row{grid-template-columns:1fr 1fr;}}

  /* Skills */
  .skills-wrap{display:flex;flex-wrap:wrap;gap:7px;}
  .skill-tag{padding:5px 12px;background:var(--t50);color:var(--t700);
    border:1px solid var(--t200);border-radius:20px;font-size:11px;font-weight:700;
    transition:all .15s;cursor:default;}
  .skill-tag:hover{background:var(--t100);}

  /* Employment rows */
  .emp-row{display:flex;align-items:center;justify-content:space-between;
    padding:9px 0;border-bottom:1px solid var(--t50);}
  .emp-row:last-child{border-bottom:none;}
  .emp-key{font-size:11px;color:var(--s500);font-weight:500;}
  .emp-val{font-size:12px;font-weight:800;color:var(--t700);}
  .emp-val-accent{font-size:13px;font-weight:800;color:var(--t600);}

  /* Loading spinner */
  .loading-container{display:flex;justify-content:center;align-items:center;min-height:100vh;}
  .error-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px;}
`;

const API_BASE = 'https://pmsbackend.pixelmindsolutions.com/api';

const StaffMyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    personal: {
      name: '',
      employeeId: '',
      email: '',
      mobile: '',
      address: '',
      joiningDate: '',
      bloodGroup: '',
    },
    professional: {
      role: '',
      department: '',
      manager: 'N/A',
      joinDate: '',
      workLocation: '',
    },
    employment: {
      salary: 'N/A',
      bankAccount: 'N/A',
      pfNumber: 'N/A',
      uanNumber: 'N/A',
      insuranceNumber: 'N/A',
    },
    skills: [],
    isActive: true
  });

  // Get token from sessionStorage
  const getToken = () => {
    const staffDetails = JSON.parse(sessionStorage.getItem('staffDetails'));
    return staffDetails?.token;
  };

  // Fetch staff profile from backend
  const fetchStaffProfile = async () => {
    const token = getToken();
    
    if (!token) {
      setError('Authentication required. Please login again.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/staff/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        const staff = data.data;
        
        // Format address from address object
        const formattedAddress = staff.address ? 
          `${staff.address.street || ''}${staff.address.street ? ', ' : ''}${staff.address.city || ''}${staff.address.city ? ', ' : ''}${staff.address.state || ''}${staff.address.pincode ? ' - ' + staff.address.pincode : ''}` : 'Not provided';
        
        setProfileData({
          personal: {
            name: staff.employeeName || '',
            employeeId: staff.employeeId || '',
            email: staff.email || '',
            mobile: staff.mobile || '',
            address: formattedAddress || 'Not provided',
            joiningDate: staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString() : 'N/A',
            bloodGroup: staff.bloodGroup || 'Not specified',
          },
          professional: {
            role: staff.role || '',
            department: getDepartmentFromRole(staff.role),
            manager: 'Not Assigned',
            joinDate: staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString() : 'N/A',
            workLocation: 'Office',
          },
          employment: {
            salary: 'To be updated',
            bankAccount: 'To be updated',
            pfNumber: 'To be updated',
            uanNumber: 'To be updated',
            insuranceNumber: 'To be updated',
          },
          skills: getSkillsFromRole(staff.role),
          isActive: staff.isActive
        });
      } else {
        setError(data.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get department based on role
  const getDepartmentFromRole = (role) => {
    const roleDeptMap = {
      'Admin': 'Administration',
      'Manager': 'Management',
      'HR': 'Human Resources',
      'Full Stack Developer': 'Development',
      'Frontend Developer': 'Development',
      'Backend Developer': 'Development',
      'Designer': 'Design',
      'QA Engineer': 'Quality Assurance',
      'DevOps Engineer': 'Infrastructure',
      'Project Manager': 'Project Management',
      'Teacher': 'Education',
      'Accountant': 'Finance',
      'Librarian': 'Library',
      'Staff': 'General'
    };
    return roleDeptMap[role] || 'General';
  };

  // Helper function to get skills based on role
  const getSkillsFromRole = (role) => {
    const skillMap = {
      'Full Stack Developer': ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'REST APIs'],
      'Frontend Developer': ['React', 'HTML/CSS', 'JavaScript', 'Tailwind CSS', 'UI/UX Design'],
      'Backend Developer': ['Node.js', 'Python', 'SQL', 'MongoDB', 'API Development'],
      'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
      'Project Manager': ['Agile', 'Scrum', 'Team Leadership', 'Risk Management', 'Client Communication'],
      'Designer': ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Prototyping'],
      'QA Engineer': ['Testing', 'Automation', 'Selenium', 'JIRA', 'Bug Tracking'],
      'HR': ['Recruitment', 'Employee Relations', 'Performance Management', 'HR Policies'],
      'Manager': ['Leadership', 'Strategic Planning', 'Team Management', 'Decision Making']
    };
    return skillMap[role] || ['Team Work', 'Communication', 'Problem Solving'];
  };

  useEffect(() => {
    fetchStaffProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const token = getToken();
    
    try {
      // You can implement update profile API here
      alert('Profile update feature coming soon!');
      setIsEditing(false);
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => setIsEditing(false);
  
  const handleChange = (section, field, value) =>
    setProfileData(p => ({ ...p, [section]: { ...p[section], [field]: value } }));

  const initials = profileData.personal.name ? profileData.personal.name.split(' ').map(n => n[0]).join('') : 'S';

  // Field component
  const Field = ({ label, value, section, fieldKey, type = 'text', icon, readOnly = false }) => (
    <div className="field-wrap">
      <label className="field-label">{label}</label>
      {isEditing && section && !readOnly ? (
        <div className="edit-input-wrap">
          {icon && <span className="edit-input-icon">{icon}</span>}
          {type === 'textarea' ? (
            <textarea rows={3}
              className={`edit-input${icon ? ' edit-input-has-icon' : ''}`}
              value={value}
              onChange={e => handleChange(section, fieldKey, e.target.value)}/>
          ) : (
            <input type={type}
              className={`edit-input${icon ? ' edit-input-has-icon' : ''}`}
              value={value}
              onChange={e => handleChange(section, fieldKey, e.target.value)}/>
          )}
        </div>
      ) : (
        <div className="field-val">
          {icon && <span className="field-icon">{icon}</span>}
          <span className="field-text">{value || 'Not provided'}</span>
        </div>
      )}
    </div>
  );

  // Read-only field component
  const ReadField = ({ label, value, icon }) => (
    <div className="field-wrap">
      <label className="field-label">{label}</label>
      <div className="field-val">
        {icon && <span className="field-icon">{icon}</span>}
        <span className="field-text">{value || 'Not provided'}</span>
      </div>
    </div>
  );

  // Section component
  const Section = ({ icon, title, badge, children, className = '' }) => (
    <div className={`card ${className}`}>
      <div className="section-hdr">
        <h3 className="section-title">
          <span className="section-icon">{icon}</span>
          {title}
        </h3>
        {badge}
      </div>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="text-center">
          <FiLoader className="animate-spin" size={40} style={{ color: '#0d9488' }} />
          <p className="mt-3 text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="bg-red-50 p-8 rounded-2xl max-w-md">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="prof-root">
      <style>{style}</style>
      <div className="prof-inner">

        {/* Page header */}
        <div className="page-hdr">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-sub">Manage your personal and professional information</p>
          </div>
          <div className="hdr-btns">
            {!isEditing ? (
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                <FiEdit3 style={{fontSize:14}}/>Edit Profile
              </button>
            ) : (
              <>
                <button className="btn-save" onClick={handleSave}>
                  <FiSave style={{fontSize:14}}/>Save Changes
                </button>
                <button className="btn-cancel" onClick={handleCancel}>
                  <FiX style={{fontSize:14}}/>Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="layout-grid">

          {/* Profile sidebar */}
          <div>
            <div className="card profile-card">
              <div className="avatar-section">
                <div className="avatar">{initials}</div>
                <p className="profile-name">{profileData.personal.name}</p>
                <p className="profile-role">{profileData.professional.role}</p>
                <span className="dept-chip">{profileData.professional.department}</span>
              </div>

              {/* Quick stats */}
              <div className="quick-stats">
                <div className="qs-tile">
                  <FiAward className="qs-icon"/>
                  <span className="qs-label">Performance</span>
                  <span className="qs-val">92%</span>
                </div>
                <div className="qs-tile">
                  <FiActivity className="qs-icon"/>
                  <span className="qs-label">Attendance</span>
                  <span className="qs-val">95%</span>
                </div>
              </div>

              {/* Employee ID */}
              <div className="emp-id-chip">
                <div className="emp-id-label">Employee ID</div>
                <div className="emp-id-val">{profileData.personal.employeeId}</div>
              </div>

              {/* Contact info */}
              <div className="contact-list">
                <div className="contact-item">
                  <div className="contact-icon-wrap"><FiMail /></div>
                  <span className="contact-text">{profileData.personal.email}</span>
                </div>
                <div className="contact-item">
                  <div className="contact-icon-wrap"><FiPhone /></div>
                  <span className="contact-text">{profileData.personal.mobile}</span>
                </div>
                <div className="contact-item">
                  <div className="contact-icon-wrap"><FiMapPin /></div>
                  <span className="contact-text">{profileData.professional.workLocation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detail sections */}
          <div className="detail-stack">

            {/* Personal Information */}
            <Section
              icon={<FiUser style={{fontSize:12}}/>}
              title="Personal Information"
              badge={
                <div className="active-badge">
                  <div className="pulse-dot"/>{profileData.isActive ? 'Active' : 'Inactive'}
                </div>
              }
            >
              <div className="fields-grid">
                <Field label="Full Name" value={profileData.personal.name} section="personal" fieldKey="name" readOnly />
                <Field label="Email" value={profileData.personal.email} section="personal" fieldKey="email" type="email" icon={<FiMail />} readOnly />
                <Field label="Mobile" value={profileData.personal.mobile} section="personal" fieldKey="mobile" type="tel" icon={<FiPhone />} readOnly />
                <Field label="Joining Date" value={profileData.personal.joiningDate} section="personal" fieldKey="joiningDate" type="date" readOnly />
                <ReadField label="Blood Group" value={profileData.personal.bloodGroup} icon={<FiShield />} />
                <div className="col-span-2">
                  <Field label="Address" value={profileData.personal.address} section="personal" fieldKey="address" type="textarea" icon={<FiMapPin />} readOnly />
                </div>
              </div>
            </Section>

            {/* Professional Information */}
            <Section icon={<FiBriefcase style={{fontSize:12}}/>} title="Professional Information">
              <div className="fields-grid">
                <ReadField label="Role" value={profileData.professional.role} />
                <ReadField label="Department" value={profileData.professional.department} />
                <ReadField label="Reporting Manager" value={profileData.professional.manager} icon={<FiUser />} />
                <ReadField label="Join Date" value={profileData.professional.joinDate} icon={<FiCalendar />} />
                <ReadField label="Work Location" value={profileData.professional.workLocation} icon={<FiMapPin />} />
              </div>
            </Section>

            {/* Skills + Employment */}
            <div className="bottom-row">

              <Section icon={<FiStar style={{fontSize:12}}/>} title="Skills & Expertise">
                <div className="skills-wrap">
                  {profileData.skills.map((s, i) => (
                    <span key={i} className="skill-tag">{s}</span>
                  ))}
                </div>
              </Section>

              <Section icon={<FiDollarSign style={{fontSize:12}}/>} title="Employment Details">
                <div className="emp-row">
                  <span className="emp-key">Salary</span>
                  <span className="emp-val">{profileData.employment.salary}</span>
                </div>
                <div className="emp-row">
                  <span className="emp-key">Bank Account</span>
                  <span className="emp-val">{profileData.employment.bankAccount}</span>
                </div>
                <div className="emp-row">
                  <span className="emp-key">PF Number</span>
                  <span className="emp-val">{profileData.employment.pfNumber}</span>
                </div>
                <div className="emp-row">
                  <span className="emp-key">UAN Number</span>
                  <span className="emp-val">{profileData.employment.uanNumber}</span>
                </div>
                <div className="emp-row">
                  <span className="emp-key">Insurance No.</span>
                  <span className="emp-val">{profileData.employment.insuranceNumber}</span>
                </div>
              </Section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffMyProfile;