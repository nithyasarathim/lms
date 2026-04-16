import React from 'react'
import HeaderComponent from '../../shared/components/HeaderComponent'
import ClassroomList from './ClassroomList'

const ClassroomPage = () => {
  return (
    <>
    <HeaderComponent title="Student Classrooms"/>
    <ClassroomList/>
    </>
  )
}

export default ClassroomPage