import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from './../../shared/components/HeaderComponent';
import ClassroomList from './ClassroomList';
import ClassroomDetails from './ClassroomDetails';

const ClassroomPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const classroomId = searchParams.get('classroomId');

  const handleSelectClassroom = (id) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', 'classrooms');
    newParams.set('classroomId', id);
    newParams.set('view', 'stream');
    setSearchParams(newParams);
  };

  const handleBack = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('classroomId');
    newParams.delete('view');
    setSearchParams(newParams);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50/30">
      <div className="w-full sticky top-0 pt-3 z-30 bg-white flex-none border-b border-gray-100">
        <Header title={classroomId ? 'Classroom Details' : 'Classrooms'} />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="h-full">
          {classroomId ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ClassroomDetails 
                onBack={handleBack} 
                id={classroomId} 
              />
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              <ClassroomList 
                onSelectClassroom={handleSelectClassroom} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassroomPage;