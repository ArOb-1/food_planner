import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <h1 className="text-5xl font-bold text-gray-900 mb-6">
        План питания, который учитывает <span className="text-green-600">вас</span>
      </h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl">
        Аллергии, предпочтения, любимые и ненавистные продукты — AI учтёт всё
        и составит персональный план на день или неделю.
      </p>
      <Link
        to="/register"
        className="bg-green-600 text-white text-lg px-8 py-4 rounded-xl hover:bg-green-700 transition"
      >
        Зарегистрироваться и создать план
      </Link>
    </div>
  )
}