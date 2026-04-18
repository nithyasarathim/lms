import React from 'react';
import { useSearchParams } from 'react-router-dom';

import Header from '../components/HeaderComponent';
import ClassroomDetails from './ClassroomDetails';
import ClassroomList from './ClassroomList';

const ClassroomPage = ({ viewerRole = 'FACULTY' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const classroomId = searchParams.get('classroomId');

  const handleSelectClassroom = (id) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'classrooms');
    nextParams.set('classroomId', id);
    setSearchParams(nextParams);
  };

  const handleBack = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('classroomId');
    setSearchParams(nextParams);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="w-full sticky top-0 pt-3 z-30 bg-white flex-none">
        <Header title={classroomId ? 'Classroom Details' : 'Classrooms'} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="h-full">
          {classroomId ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ClassroomDetails
                id={classroomId}
                onBack={handleBack}
                viewerRole={viewerRole}
              />
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              <ClassroomList
                onSelectClassroom={handleSelectClassroom}
                viewerRole={viewerRole}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassroomPage;
