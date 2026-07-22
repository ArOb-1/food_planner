import toast from 'react-hot-toast'

export default function Donate() {
  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Поддержать проект</h1>
      <p className="text-gray-500 mb-8">Если сервис был полезен, буду рад любому донату.</p>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">СБП / Банковский перевод</h2>
        <div className="space-y-3">
          <InfoRow label="Банк" value="Т-Банк (Тинькофф)" />
          <InfoRow label="Телефон" value="+7 926-780-65-62" />
          <InfoRow label="Имя" value="Артём Большаков" />
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText('+79267806562')
            toast.success('Номер скопирован!')
          }}
          className="mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors text-sm"
        >
          Скопировать номер
        </button>
      </div>

      <div className="text-center text-gray-400 text-sm">
        Спасибо! Каждый рубль мотивирует делать сервис лучше.
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  )
}