import * as React from 'react'

function EmptyState({ title, description, icon: Icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-6">
        {Icon ? (
          <div className="flex items-center justify-center">{Icon()}</div>
        ) : (
          <div className="w-24 h-24 bg-gray-100 rounded-full" />
        )}
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-bold">+</span>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">{title}</h2>

      {Array.isArray(description) ? (
        <>
          <p className="text-gray-500 text-sm">{description[0]}</p>
          <p className="text-gray-500 text-sm mb-6">{description[1]}</p>
        </>
      ) : (
        <p className="text-gray-500 text-sm mb-6">{description}</p>
      )}

      {action}
    </div>
  )
}

export { EmptyState }
