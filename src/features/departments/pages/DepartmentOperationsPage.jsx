import PageHeaderBanner from '@components/ui/PageHeaderBanner'
import { useQueryParams } from '@hooks/useQueryParams'
import React from 'react'

const DepartmentOperationsPage = () => {
    const {get} = useQueryParams();
      const departmentId = get("departmentId");
console.log(departmentId)
  return (
    <div>
      <PageHeaderBanner title={'Department Operations'}/>
    </div>
  )
}

export default DepartmentOperationsPage
