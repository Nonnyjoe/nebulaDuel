import React from 'react'
import CommonPageBanner from './Components/commonPageBanner/CommonPageBanner'
import WhoWeAre from './Components/whoWeAre/WhoWeAre'
import PowerFulSer from './Components/powerFulService/PowerFulSer'
import Footer from './Components/footer/Footer'


export const About = () => {
  return (
    <div>
    <CommonPageBanner title="About Us" img="assets/img/breadcrumb_img01.png" />
    <WhoWeAre />
    <PowerFulSer />
    <Footer />
        

    </div>
  )
}
