import React, { useState, useEffect, useRef } from 'react';
import { api, socket } from '../api';
import { Send, MessageSquare, Loader2, ListTodo, Plus, X, CheckCircle2, Circle, Clock, User as UserIcon, ChevronLeft } from 'lucide-react';

const Workspace = () => {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'tasks'
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  
  // Chat State
  const [messages, setMessages] = useState({});
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Task State
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) fetchUserProjects();
    else setLoading(false);
    
    // Setup socket listener
    socket.on('receive_message', (data) => {
      setMessages(prev => ({
        ...prev,
        [data.projectId]: [...(prev[data.projectId] || []), data]
      }));
    });

    return () => socket.off('receive_message');
  }, [token]);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeProject, activeTab]);

  useEffect(() => {
    if (activeProject && activeTab === 'tasks') {
      fetchTasks(activeProject._id);
    }
  }, [activeProject, activeTab]);

  const fetchUserProjects = async () => {
    try {
      const res = await api.get('/auth/me', {
        headers: { 'x-auth-token': token }
      });
      setUser(res.data);
      const joined = res.data.joinedProjects || [];
      setProjects(joined);
      if (joined.length > 0) {
        joinRoom(joined[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = (project) => {
    setActiveProject(project);
    setShowMobileSidebar(false);
    socket.emit('join_project', { projectId: project._id });
  };

  // --- CHAT LOGIC ---
  const sendMessage = async (e) => {
    e.preventDefault();
    if (currentMessage !== '' && activeProject) {
      const messageData = {
        projectId: activeProject._id,
        author: user.name,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ':' + String(new Date(Date.now()).getMinutes()).padStart(2, '0')
      };

      await socket.emit('send_message', messageData);
      setMessages(prev => ({
        ...prev,
        [activeProject._id]: [...(prev[activeProject._id] || []), messageData]
      }));
      setCurrentMessage('');
    }
  };

  // --- TASK LOGIC ---
  const fetchTasks = async (projectId) => {
    try {
      const res = await api.get(`/tasks/project/${projectId}`, {
        headers: { 'x-auth-token': token }
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const res = await api.post(`/tasks/project/${activeProject._id}`, 
        { title: newTaskTitle, description: newTaskDesc },
        { headers: { 'x-auth-token': token } }
      );
      setTasks([...tasks, res.data]);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setShowTaskForm(false);
    } catch (err) {
      alert(err.response?.data?.msg || 'Error creating task');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}/status`, 
        { status: newStatus },
        { headers: { 'x-auth-token': token } }
      );
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const assignTaskToSelf = async (taskId) => {
    try {
      const res = await api.put(`/tasks/${taskId}/assign`, 
        { userId: user._id },
        { headers: { 'x-auth-token': token } }
      );
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
    } catch (err) {
      alert('Failed to assign task');
    }
  };

  const verifyTask = async (taskId) => {
    try {
      const res = await api.put(`/tasks/${taskId}/verify`, 
        {},
        { headers: { 'x-auth-token': token } }
      );
      
      setTasks(tasks.map(t => t._id === taskId ? res.data.task : t));
      
      if (res.data.projectCompleted) {
         alert('All tasks are verified! The project is now complete. +20 Reputation awarded to all members!');
         setActiveProject({ ...activeProject, status: 'Completed' });
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to verify task');
    }
  };


  const totalTasks = tasks.length;
  const verifiedTasks = tasks.filter(t => t.status === 'Verified').length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((verifiedTasks / totalTasks) * 100);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;
  if (!user) return <div className="text-center py-20 text-gray-400 text-xl font-semibold">Please log in to access your workspace.</div>;

  return (
    <div className="flex flex-col md:flex-row glass-panel rounded-3xl overflow-hidden min-h-[85vh] md:h-[80vh] max-w-7xl mx-auto mt-4 border border-gray-800 shadow-2xl relative">
       <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -ml-32 -mt-32 pointer-events-none"></div>
      
      {/* Sidebar */}
      <div className={`w-full md:w-1/4 bg-gray-900/50 border-r border-gray-800 md:flex flex-col relative z-10 ${showMobileSidebar ? 'flex' : 'hidden md:flex'}`}>
        <div className="p-6 border-b border-gray-800 bg-gray-900/80 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ListTodo className="text-blue-500" /> Workspaces
          </h2>
          {activeProject && (
            <button onClick={() => setShowMobileSidebar(false)} className="md:hidden text-gray-400">
              <X size={20} />
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-2 custom-scrollbar">
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">You haven't joined any projects yet.</p>
          ) : (
            projects.map(project => (
              <button
                key={project._id}
                onClick={() => joinRoom(project)}
                className={`w-full text-left px-4 py-4 rounded-xl transition ${
                  activeProject?._id === project._id ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'hover:bg-gray-800 text-gray-400'
                }`}
              >
                <div className={`font-semibold ${activeProject?._id === project._id ? 'text-white' : 'text-gray-300'}`}>
                  {project.title}
                </div>
                <div className="text-xs mt-1 opacity-80 truncate">{project.description}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className={`flex-1 flex flex-col bg-gray-900/50 relative z-10 w-full md:w-3/4 ${!showMobileSidebar ? 'flex' : 'hidden md:flex'}`}>
        {activeProject ? (
          <>
            {/* Header / Tabs */}
            <div className="p-4 md:p-6 border-b border-gray-800 bg-gray-900/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setShowMobileSidebar(true)}
                  className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition"
                >
                  <ChevronLeft size={24} />
                </button>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    {activeProject.title}
                    {activeProject.status === 'Completed' && (
                    <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                      <CheckCircle2 size={12}/> Completed
                    </span>
                  )}
                </h3>
                <div className="text-xs md:text-sm text-gray-400 mt-0.5">Project Workspace</div>

                {activeTab === 'tasks' && tasks.length > 0 && (
                  <div className="mt-4 w-64">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-emerald-400 font-medium">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700 h-fit w-full sm:w-auto">
                <button 
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                  <MessageSquare size={16} /> Chat
                </button>
                <button 
                  onClick={() => setActiveTab('tasks')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'tasks' ? 'bg-yellow-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                  <ListTodo size={16} /> Tasks
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto relative bg-gray-900/30 custom-scrollbar">
              
              {/* --- CHAT VIEW --- */}
              {activeTab === 'chat' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {(messages[activeProject._id] || []).map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.author === user.name ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs text-gray-400 font-medium">{msg.author}</span>
                          <span className="text-[10px] text-gray-600">{msg.time}</span>
                        </div>
                        <div className={`px-5 py-3 rounded-2xl max-w-[70%] ${
                          msg.author === user.name ? 'bg-blue-600 text-white rounded-tr-sm shadow-md shadow-blue-900/20' : 'bg-gray-800 text-gray-200 border border-gray-700/50 rounded-tl-sm shadow-sm'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <div className="p-6 bg-gray-900/80 border-t border-gray-800 mt-auto">
                    <form onSubmit={sendMessage} className="flex gap-4">
                      <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder={`Message #${activeProject.title}...`}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-inner"
                      />
                      <button
                        type="submit"
                        disabled={!currentMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 font-medium"
                      >
                        <Send size={20} className="mr-2" /> Send
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* --- TASKS VIEW (KANBAN) --- */}
              {activeTab === 'tasks' && (
                <div className="h-full p-6 flex flex-col">
                  {/* Task Actions */}
                  <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2"><ListTodo size={20} className="text-yellow-500"/> Kanban Board</h4>
                    <button 
                      onClick={() => setShowTaskForm(!showTaskForm)}
                      className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2.5 rounded-lg transition border border-gray-700 flex items-center justify-center gap-2"
                    >
                      {showTaskForm ? <X size={16} /> : <Plus size={16} />} {showTaskForm ? 'Cancel' : 'New Task'}
                    </button>
                  </div>

                  {showTaskForm && (
                     <form onSubmit={handleCreateTask} className="mb-8 p-4 bg-gray-800/80 border border-gray-700 rounded-xl animate-in fade-in slide-in-from-top-2">
                        <div className="flex gap-4 mb-4">
                          <input required type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Task Title (e.g., Build Login API)" className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                        </div>
                        <div className="flex gap-4">
                          <input type="text" value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} placeholder="Description (Optional)" className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                          <button type="submit" className="bg-yellow-600 hover:bg-yellow-500 px-6 py-2 rounded-lg font-medium text-white transition">Add</button>
                        </div>
                     </form>
                  )}

                  <div className="flex gap-4 flex-1 min-h-[500px] overflow-x-auto pb-6 custom-scrollbar">
                     {/* Column: To Do */}
                     <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-800 flex flex-col min-w-[280px] w-[280px] sm:w-auto sm:flex-1">
                        <h5 className="font-bold text-gray-300 mb-4 flex items-center gap-2"><Circle size={16} className="text-gray-500"/> To Do</h5>
                        <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                           {tasks.filter(t => t.status === 'To Do').map(task => (
                             <div key={task._id} className="bg-gray-800 border border-gray-700 p-4 rounded-xl hover:border-gray-600 transition group cursor-default">
                                <h6 className="font-bold text-white text-sm mb-1">{task.title}</h6>
                                {task.description && <p className="text-xs text-gray-400 mb-3">{task.description}</p>}
                                
                                <div className="flex justify-between items-center mt-4">
                                  {task.assignedTo ? (
                                    <span className="text-[10px] flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2 py-1 rounded"><UserIcon size={12}/> {task.assignedTo.name}</span>
                                  ) : (
                                    <button onClick={() => assignTaskToSelf(task._id)} className="text-[10px] text-gray-500 hover:text-white bg-gray-900 px-2 py-1 rounded transition">Assign Self</button>
                                  )}
                                  <button onClick={() => updateTaskStatus(task._id, 'In Progress')} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md transition opacity-0 group-hover:opacity-100">Start</button>
                                </div>
                             </div>
                           ))}
                           {tasks.filter(t => t.status === 'To Do').length === 0 && <div className="text-gray-600 text-sm text-center py-4 border border-dashed border-gray-800 rounded-lg">No tasks</div>}
                        </div>
                     </div>

                     {/* Column: In Progress */}
                     <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-800 flex flex-col min-w-[280px] w-[280px] sm:w-auto sm:flex-1">
                        <h5 className="font-bold text-blue-400 mb-4 flex items-center gap-2"><Clock size={16} /> In Progress</h5>
                        <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                           {tasks.filter(t => t.status === 'In Progress').map(task => (
                             <div key={task._id} className="bg-gray-800 border border-blue-900 p-4 rounded-xl hover:border-blue-700 transition group cursor-default shadow-lg shadow-blue-900/10">
                                <h6 className="font-bold text-white text-sm mb-1">{task.title}</h6>
                                {task.description && <p className="text-xs text-blue-200/50 mb-3">{task.description}</p>}
                                
                                <div className="flex justify-between items-center mt-4">
                                  {task.assignedTo ? (
                                    <span className="text-[10px] flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2 py-1 rounded"><UserIcon size={12}/> {task.assignedTo.name}</span>
                                  ) : (
                                    <button onClick={() => assignTaskToSelf(task._id)} className="text-[10px] text-gray-500 hover:text-white bg-gray-900 px-2 py-1 rounded transition">Assign Self</button>
                                  )}
                                  <button onClick={() => updateTaskStatus(task._id, 'Pending Verification')} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-md transition opacity-0 group-hover:opacity-100 flex items-center gap-1"><CheckCircle2 size={14}/> Complete</button>
                                </div>
                             </div>
                           ))}
                           {tasks.filter(t => t.status === 'In Progress').length === 0 && <div className="text-gray-600 text-sm text-center py-4 border border-dashed border-gray-800 rounded-lg">No tasks</div>}
                        </div>
                     </div>

                     {/* Column: Pending Verification */}
                     <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-800 flex flex-col min-w-[280px] w-[280px] sm:w-auto sm:flex-1">
                        <h5 className="font-bold text-purple-400 mb-4 flex items-center gap-2"><Clock size={16} /> Pending Verification</h5>
                        <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                           {tasks.filter(t => t.status === 'Pending Verification').map(task => (
                             <div key={task._id} className="bg-gray-800 border border-purple-900 p-4 rounded-xl hover:border-purple-700 transition group cursor-default shadow-lg shadow-purple-900/10">
                                <h6 className="font-bold text-white text-sm mb-1">{task.title}</h6>
                                {task.description && <p className="text-xs text-purple-200/50 mb-3">{task.description}</p>}
                                
                                <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-700/50">
                                  {task.assignedTo ? (
                                    <span className="text-[10px] flex items-center gap-1 text-gray-400 bg-gray-800 px-2 py-1 rounded"><UserIcon size={12}/> {task.assignedTo.name}</span>
                                  ) : (
                                    <span className="text-[10px]"></span>
                                  )}
                                  {user._id === (activeProject.owner?._id || activeProject.owner) && (
                                    <button onClick={() => verifyTask(task._id)} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-md transition flex items-center gap-1 shadow-md"><CheckCircle2 size={14}/> Verify</button>
                                  )}
                                </div>
                             </div>
                           ))}
                           {tasks.filter(t => t.status === 'Pending Verification').length === 0 && <div className="text-gray-600 text-sm text-center py-4 border border-dashed border-gray-800 rounded-lg">No tasks</div>}
                        </div>
                     </div>

                     {/* Column: Verified */}
                     <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-800 flex flex-col opacity-80 min-w-[280px] w-[280px] sm:w-auto sm:flex-1">
                        <h5 className="font-bold text-emerald-400 mb-4 flex items-center gap-2"><CheckCircle2 size={16}/> Verified</h5>
                        <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                           {tasks.filter(t => t.status === 'Verified').map(task => (
                             <div key={task._id} className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl cursor-default">
                                <h6 className="font-bold text-gray-400 text-sm mb-1 line-through">{task.title}</h6>
                                
                                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700/50">
                                  {task.assignedTo && (
                                    <span className="text-[10px] flex items-center gap-1 text-gray-500"><UserIcon size={12}/> by {task.assignedTo?.name || 'Unknown'}</span>
                                  )}
                                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">+10 Rep</span>
                                </div>
                             </div>
                           ))}
                           {tasks.filter(t => t.status === 'Verified').length === 0 && <div className="text-gray-600 text-sm text-center py-4 border border-dashed border-gray-800 rounded-lg">No tasks</div>}
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </div>

          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 h-full">
            <ListTodo size={48} className="mb-4 opacity-50 text-blue-500" />
            <p className="text-lg font-medium text-gray-400">Select a project to enter workspace</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workspace;
