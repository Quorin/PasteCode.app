'use client'

const CollapsableButton = ({ id }: { id: string }) => {
  const handleCollapse = () => {
    document.getElementById(id)?.classList['toggle']('hidden')
  }

  return (
    <button
      onClick={handleCollapse}
      data-collapse-toggle="navbar-default"
      type="button"
      className="transition-all inline-flex items-center p-2 ml-3 text-sm rounded-lg md:hidden focus:outline-none text-muted-foreground hover:bg-muted"
      aria-controls="navbar-default"
      aria-expanded="false"
    >
      <span className="sr-only">Open main menu</span>
      <svg
        className="w-6 h-6"
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          clipRule="evenodd"
        ></path>
      </svg>
    </button>
  )
}

export default CollapsableButton
