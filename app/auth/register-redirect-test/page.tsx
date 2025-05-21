export default function RegisterRedirectTestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 p-4">
      <h1 className="text-3xl font-bold mb-8">Register Redirect Test</h1>

      <div className="space-y-4 w-full max-w-md">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-2">HTML Link</h2>
          <a
            href="/auth/select-role-register"
            className="block w-full py-2 px-4 bg-blue-500 text-white text-center rounded hover:bg-blue-600"
          >
            Register with HTML Link
          </a>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Form Submit</h2>
          <form action="/auth/select-role-register" method="get">
            <button
              type="submit"
              className="block w-full py-2 px-4 bg-green-500 text-white text-center rounded hover:bg-green-600"
            >
              Register with Form Submit
            </button>
          </form>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Absolute URL</h2>
          <a
            href={`${process.env.NEXT_PUBLIC_SITE_URL || ""}/auth/select-role-register`}
            className="block w-full py-2 px-4 bg-purple-500 text-white text-center rounded hover:bg-purple-600"
          >
            Register with Absolute URL
          </a>
        </div>
      </div>
    </div>
  )
}
