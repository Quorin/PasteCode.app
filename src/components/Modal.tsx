import { Dialog, Transition } from '@headlessui/react'
import { ExclamationIcon } from '@heroicons/react/outline'
import { Fragment, useRef } from 'react'

type Props = {
  title: string
  description: string
  accentColor: string
  visible: boolean
  action: () => void
  actionTitle: string
  close: () => void
}

const Modal = ({
  close,
  accentColor,
  title,
  description,
  action,
  actionTitle,
  visible,
}: Props) => {
  const cancelButtonRef = useRef(null)

  return (
    <Transition.Root show={visible} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={close}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative bg-zinc-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
                <div className="bg-zinc-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div
                      className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-${accentColor}-100 sm:mx-0 sm:h-10 sm:w-10`}
                    >
                      <ExclamationIcon
                        className={`h-6 w-6 text-${accentColor}-600`}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-lg leading-6 font-medium text-zinc-50"
                      >
                        {title}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-zinc-300">{description}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-${accentColor}-600 text-base font-medium text-zinc-100 hover:bg-${accentColor}-700 focus:outline-none focus:ring-2 focus:ring-${accentColor}-500 sm:ml-3 sm:w-auto sm:text-sm`}
                    onClick={action}
                  >
                    {actionTitle}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-zinc-900 hover:border-zinc-800 shadow-sm px-4 py-2 bg-zinc-800 text-base font-medium text-zinc-100 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={close}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default Modal
