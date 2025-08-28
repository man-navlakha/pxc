import React from 'react'

const Search = () => {
  return (
    <div>
      <div className='p-7 '>
        <div className="relative flex shadow-2xl">
            <input type="text" className="flex-1 w-full px-2 py-2 flex max-w-[360px] flex-col items-center outline-none text-sm rounded-lg border max-h-30 transition-all duration-100 border-gray-200 bg-gray-00 text-gray-1k hover:border-gray-300 focus-within:border-gray-300 dark:bg-gray-50 shadow-input hover:shadow-input-hover focus-within:shadow-input" placeholder="Search" autocomplete="off" aria-autocomplete="list" data-rr-is-password="true" />
         
                <span className="-mr-1"><svg width="50" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19.5833M19.5833 12L12.5833 5M19.5833 12L12.5833 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vector-effect="non-scaling-stroke"></path></svg></span>
            </div>
            </div>

    </div>
  )
}

export default Search
