const stripe=Stripe("pk_test_51Og1iUSJtgVpgsZdmVvzGrkZhF4s18U9X4JGMDlkb7sWJtjLwwVUDPEmKf0BIGDWDPxj268VZJa3gIxmVKShdXr400DnIsYN6U")
import axios from "axios"
import {showAlert} from "./alert"
export const bookTour= async(tourId)=>{
    try{
            const session= await axios(`/api/booking/getpaymentsession/${tourId}`)
           await stripe.redirectToCheckout({
               sessionId: session.data.session.id
            })
          
    }
    catch(err){
          showAlert("error",err)
    }
}