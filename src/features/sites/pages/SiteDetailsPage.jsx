import PageHeaderBanner from '@components/ui/PageHeaderBanner'
import { useQueryParams } from '@hooks/useQueryParams';
import { getSiteDetails } from '@store/slices/site.slice';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const SiteDetailsPage = () => {
    const dispatch = useDispatch();
    const {get} = useQueryParams();
    const siteId = get("siteId")


    const {isGettingSiteDetails,siteData} = useSelector((state) => state.site);


    useEffect(() => {
        if(!siteId) return;
        dispatch(getSiteDetails(siteId))
    },[dispatch,siteId])

    console.log(siteData)

  return (
    <div>
      <PageHeaderBanner title={'Site Details'}/>
    </div>
  )
}

export default SiteDetailsPage
