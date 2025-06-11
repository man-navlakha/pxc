import Cookies from "js-cookie";

const Select = () => {

  return (
    <div>
    {Cookies.get("pdfid")}  
    </div>
  )
}

export default Select
