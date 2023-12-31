import React,{ useState, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Folder, State, Task } from '../App.tsx';
import DOMPurify from 'dompurify';

export type Action = 
| { type: 'ADD_FOLDER', payload: Folder }
| { type: 'EDIT_FOLDER', payload: { original: Folder, updated: Folder } }
| { type: 'SET_FOLDERS', payload: Folder[] }
| { type: 'SET_SELECTED_FOLDER', payload: Folder | null }
| { type: 'SET_EDITING_FOLDER', payload: Folder }
| { type: 'EDIT_TASK', payload: { original: Task, updated: Task }}
| { type: 'SET_SELECTED_TASK', payload: Task | null }
| { type: 'REMOVE_TASK', payload: { folder: Folder, task: Task } }
| { type: 'SET_FOLDER_NAME', payload: string }
| { type: 'SET_TASK_PRIORITY', payload: 'low' | 'medium' | 'high' }
| { type: 'SET_TASK_NAME', payload: string }
| { type: 'SET_TASK_DUE_DATE', payload: string }
| { type: 'REMOVE_FOLDER', payload: Folder }
| { type: 'REMOVE_ALL_FOLDERS', payload: [] }
| { type: 'SET_TASK_STATUS', payload: 'completed' | 'in progress' | 'pending' }
| { type: 'SET_SEARCH', payload: string }
| { type: 'SET_SUBTASK', payload: string }
| { type: 'TOGGLE_FAVORITE', payload: { folderId: string } }
| { type: 'ADD_TASK', payload: { folder: Folder, task: Task }}
| { type: 'UPDATED_TASK', payload: { original: Task, updated: Task} }



export const reducer = ( state: State, action: Action ) => {
  switch(action.type) {
    case 'EDIT_TASK':
        return {
          ...state,
          folders: state.folders.map((folder) =>
            folder.id === action.payload.original.folderId
              ? {
                  ...folder,
                  tasks: folder.tasks.map((task) =>
                    task.id === action.payload.original.id ? action.payload.updated : task
                  ),
                }
              : folder
          ),
        };
      case 'UPDATED_TASK': {
          console.log(action.payload.updated.name); // This will log the updated task name
          return {
            ...state,
            taskName: action.payload.updated.name, // Updates the taskName in your state
            folders: state.folders.map((folder) =>
              folder.id === action.payload.updated.folderId
                ? {
                  ...folder,
                  tasks: folder.tasks.map((task) =>
                    task.id === action.payload.updated.id ? action.payload.updated : task
                  ),
                }
                : folder
            ),
          };
        }
      case 'ADD_TASK':
        return {...state,folders: state.folders.map(folder => folder.id === action.payload.folder.id ? { ...folder, tasks: [...folder.tasks, action.payload.task] } : folder)};
      case 'SET_TASK_NAME':
        return { ...state, taskName: action.payload };
      case 'SET_SUBTASK':
        return { ...state, subTask: action.payload };
      case 'SET_TASK_DUE_DATE':
        return { ...state, taskDueDate: action.payload };
      case 'SET_TASK_STATUS':
        return { ...state, taskStatus: action.payload };
      case 'SET_TASK_PRIORITY':
        return { ...state, taskPriority: action.payload };
      case 'ADD_FOLDER':
        return { ...state, folders: [...state.folders, action.payload] };
      case 'SET_FOLDERS':
        return { ...state, folders: action.payload };
      case 'SET_SELECTED_FOLDER':
        return { ...state, selectedFolder: action.payload };
      case 'SET_SELECTED_TASK':
        return { ...state, selectedTask: action.payload };
      case 'SET_EDITING_FOLDER':
        return { ...state, editingFolder: action.payload };
      case 'SET_FOLDER_NAME':
        return { ...state, folderName: action.payload };
      case 'SET_SEARCH':
        return { ...state, search: action.payload };
      case 'REMOVE_ALL_FOLDERS':
        return {
          ...state,
            folders: [],
        };
      case 'REMOVE_FOLDER':
        return {
          ...state,
          folders: state.folders.filter(folder => folder.id !== action.payload.id),
            };
      case 'REMOVE_TASK':
        return {...state,folders: state.folders.map(folder =>folder.id === action.payload.folder.id ? { ...folder, tasks: folder.tasks.filter(task => task.id !== action.payload.task.id) }
                : folder
            ),
              } 
      case 'EDIT_FOLDER':
        return { ...state, folders: state.folders.map(folder => folder.id === action.payload.original.id ? action.payload.updated : folder )};
      case 'TOGGLE_FAVORITE':
        return {
          ...state,
          folders: state.folders.map(folder =>
            folder.id === action.payload.folderId
              ? { ...folder, favorite: !folder.favorite }
              : folder
            ),
          };
    default:
    return state;
    }
}

export const initialState: State = {
  name: '',
  tasks: [],
  folders: [],
  selectedFolder: null,
  editingFolder: null,
  folderName: '',
  taskName: '',
  taskPriority: 'low',
  taskStatus: "pending",
  taskDueDate: '',
  search: '',
  selectedTask: '',
  subTask: '',
  editTask: [],
}

type TaskType = {
  name?: string,
  subTask?: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  folderId?: string;
  id?: string;
};

export function FolderFunctions() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isediting, setIsediting] = useState<boolean | null>(null);
  const [overlayVisible, setOverlayVisible] = useState<boolean | null>(false);
  const [openedMenu, setOpenedMenu] = useState<string | null>(null);
  const [openedFolder, setOpenedFolder] = useState<string | null>(null);
  const { taskName, taskDueDate, selectedFolder } = state;  
  const [updatedTask] = useState<null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [deleteOverlay, setDeleteOverlay] = useState<boolean>(false);
  const [selectedDeleter, setselectedDeleter] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  // const [selectedTask, setSelectedTask] = useState<string>('');
  
  // const updateTaskInCurrentFolder = (Task) => {
  //   if (selectedFolder && selectedTask && DOMPurify.sanitize(taskName.trim()) !== '') {
  //     const updatedTask = {
  //       name: taskName,
  //       subTask: state.subTask,
  //       dueDate: taskDueDate,
  //       status: state.taskStatus,
  //       priority: state.taskPriority,
  //       folderId: selectedFolder.id,
  //       id: selectedFolder.id,
  //     };
  //     console.log(updatedTask); 
  //     dispatch({ type: 'UPDATED_TASK', payload: Task }); 
  //     // taskName eller updatedTask måste upptaderas på rätt sätt
  //     setOverlayVisible(false);
  //     return updatedTask;
  //   } else {
  //     alert();
  //     return null; 
  //   }
  // };

  const updateTaskInCurrentFolder = (e) => {
    e.preventDefault();
    if (selectedFolder && selectedTask && DOMPurify.sanitize(taskName.trim()) !== '') {
      const updatedTask = {
        name: taskName,
        id: selectedFolder.id, 
        subTask: state.subTask,
        dueDate: taskDueDate,
        status: state.taskStatus,
        priority: state.taskPriority,
        folderId: selectedFolder.id,
      };
      console.log(updatedTask, updatedTask.name); 
      dispatch({ 
        type: 'UPDATED_TASK', 
        payload: { 
          original: selectedTask as Task, 
          updated: updatedTask as Task
        }
      }); 
      setIsediting(false);
      setSelectedTask(null);
      setOverlayVisible(false);
      return updatedTask;
    } else {
      return null; 
    }
  };

  

  //create a new task inside of the folder
  let newTask: Task | null = null;
  const addTaskToCurrentFolder = (e) => {
    e.preventDefault();
    if (selectedFolder && DOMPurify.sanitize(taskName.trim()) !== '') {
      newTask = {
        id: uuidv4(),
        name: taskName,
        subTask: state.subTask,
        dueDate: taskDueDate,
        status: state.taskStatus,
        priority: state.taskPriority,
        folderId: selectedFolder.id,
      };
      handleAddTask(selectedFolder, newTask);
      setOverlayVisible(false);
    } else {
      return newTask
    }
  };

  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isediting) {
      updateTaskInCurrentFolder(e);
    } else {
      addTaskToCurrentFolder(e);
    }
    // Reset the form fields to their initial state
    dispatch({ type: 'SET_TASK_NAME', payload: '' });
    dispatch({ type: 'SET_SUBTASK', payload: '' });
    dispatch({ type: 'SET_TASK_DUE_DATE', payload: '' });
    dispatch({ type: 'SET_TASK_STATUS', payload: 'pending' });
    dispatch({ type: 'SET_TASK_PRIORITY', payload: 'low' });
  };
  

  const handleTaskDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentDate = new Date();
    currentDate.setHours(0,0,0,0);
  
    const selectedDate = new Date(e.target.value);
    selectedDate.setHours(0,0,0,0);
  
    // Always update the selected task and dispatch it
    setSelectedTask({...selectedTask, dueDate: e.target.value}); // we keep the due date as string here
    dispatch({type: 'SET_TASK_DUE_DATE', payload: e.target.value});
  
    // Only show overlay if the selected date is not in the past
    if (selectedDate.getTime() > currentDate.getTime()) {
      setSelectedDate(e.target.value);
      setShowOverlay(true);
    }
}

  const handleToggleFavorite = (folderId: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: { folderId } });
  };

  const handleRemoveFolder = (folder: Folder) => {
    dispatch({ type: 'REMOVE_FOLDER', payload: folder });
  };

  const handleRemoveTask = (folder: Folder, task: Task) => {
    dispatch({ type: 'REMOVE_TASK', payload: {folder, task} });
  };

  //create a new folder
  const handleCreateFolder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (DOMPurify.sanitize(state.folderName.trim()) === '') {
      return;
    }
    const newFolder: Folder = {
      id: uuidv4(),
      name: state.folderName,
      tasks: [],
      
    };
    console.log(newFolder.id)
    dispatch({ type: 'ADD_FOLDER', payload: newFolder });
    dispatch({ type: 'SET_FOLDER_NAME', payload: '' });
    dispatch({ type: 'SET_SELECTED_FOLDER', payload: newFolder });
  }

  //change folder name
  const handleFolderChange = (name: string) => {
    if (selectedFolder) {
      const updatedFolder = { ...selectedFolder, name: name };
      handleUpdateFolder(selectedFolder, updatedFolder);
    }
  };


  const handleViewFolder = (id: string) => {
    if (openedFolder === id) {
      setOpenedFolder(null); 
  }else {
      setOpenedFolder(id);
      const selectedFolder = state.folders.find((folder) => folder.id === id);
      if (selectedFolder) {
        setSelectedFolder(selectedFolder);
      }
    }
    }
  
  const toggleMenu = (id: string) => {
    if (openedMenu === id) {
      setOpenedMenu(null);
    } else {
      setOpenedMenu(id);
    }
  };

  // 
  const handleEditFolder = (folder: Folder) => {
    dispatch({ type: 'SET_EDITING_FOLDER', payload: folder });
    dispatch({ type: 'SET_SELECTED_FOLDER', payload: folder });
    setIsediting(true);
  };

  const handleEditTask = (task: Task) => {
    dispatch({ type: 'SET_SELECTED_TASK', payload: task });
    setIsediting(true);
    setOverlayVisible(true);
  };

const handleAddTask = (folder: Folder, task: Task) => {
  dispatch({ type: 'ADD_TASK', payload: { folder, task }});
};

const handleTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSelectedTask({...selectedTask, name: e.target.value});
  dispatch({type: 'SET_TASK_NAME', payload: e.target.value});
};

const handlesubTaskChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setSelectedTask({...selectedTask, subTask: e.target.value});
  dispatch({type: 'SET_SUBTASK', payload: e.target.value});
};

const handleTaskPriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setSelectedTask({...selectedTask, priority: e.target.value as 'low' | 'medium' | 'high'});
  dispatch({type: 'SET_TASK_PRIORITY', payload: e.target.value as 'low' | 'medium' | 'high'});
};

const handleTaskStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setSelectedTask({...selectedTask, status: e.target.value as 'completed' | 'in progress' | 'pending'});
  dispatch({type: 'SET_TASK_STATUS', payload: e.target.value as 'completed' | 'in progress' | 'pending'});
};

const setSelectedFolder = (folder: Folder | null) => {
  dispatch({ type: 'SET_SELECTED_FOLDER', payload: folder });
}

  const handleUpdateFolder = (original: Folder, updated: Folder) => {
    dispatch({ type: 'EDIT_FOLDER', payload: { original, updated } });
  };

  const handleFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_FOLDER_NAME', payload: e.target.value });
    setIsediting(false);
    // Vad är den till för ??
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SEARCH', payload: e.target.value });
  };

  const removeAllFolders = (e: React.MouseEvent<HTMLHeadingElement>) => {
    console.log('selectedDeleter:', selectedDeleter);
    const text = e.currentTarget.textContent || "";
    if (selectedDeleter) {
        setselectedDeleter(text);
        setDeleteOverlay(true);
        console.log('setDeleteOverlay has been called');
    } else {
        return;
    }
};

  
  const confirmDelete = () => {
    dispatch({ type: 'REMOVE_ALL_FOLDERS', payload: [] });
    setDeleteOverlay(false);
};

  return {
    handleSubmit,
    confirmDelete,
    setDeleteOverlay,
    deleteOverlay,
    handleToggleFavorite,
    selectedDate,
    showOverlay,
    setShowOverlay,
    handleRemoveTask,
    isediting,
    setIsediting,
    updateTaskInCurrentFolder,
    selectedTask,
    handleEditTask,
    handlesubTaskChange,
    handleViewFolder,
    setOpenedFolder,
    openedFolder,
    handleTaskNameChange,
    handleTaskDueDateChange,
    handleTaskPriorityChange,
    handleTaskStatusChange,
    addTaskToCurrentFolder,
    state, 
    overlayVisible, 
    openedMenu, 
    handleSearch,
    handleCreateFolder, 
    handleFolderChange,
    handleEditFolder,
    handleFolderNameChange,
    handleRemoveFolder,
    setOverlayVisible,
    setOpenedMenu, 
    toggleMenu,
    setSelectedFolder: (folder: Folder ) => dispatch({ type: 'SET_SELECTED_FOLDER', payload: folder })
  } 
}
export default FolderFunctions;