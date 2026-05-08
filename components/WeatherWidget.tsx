import { Cloud, CloudRain, Sun } from 'lucide-react'

export default function WeatherWidget() {
  const weatherDays = [
    { day: 'Mon', temp: 72, icon: 'sun' as const },
    { day: 'Tue', temp: 68, icon: 'cloud' as const },
    { day: 'Wed', temp: 65, icon: 'rain' as const },
    { day: 'Thu', temp: 71, icon: 'sun' as const },
  ]

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'sun':
        return <Sun size={24} className="text-yellow-500" />
      case 'cloud':
        return <Cloud size={24} className="text-gray-400" />
      case 'rain':
        return <CloudRain size={24} className="text-blue-400" />
      default:
        return <Sun size={24} />
    }
  }

  return (
    <div className="bg-white border-2 border-black p-4 font-bold" style={{ transform: 'rotate(0.5deg)' }}>
      <h3 className="text-lg mb-4 flex items-center gap-2">
        <span>☀️</span> Weather Forecast
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {weatherDays.map((day, idx) => (
          <div key={idx} className="border-2 border-black p-2 bg-yellow-50 text-center">
            <p className="text-xs font-bold text-black">{day.day}</p>
            <div className="flex justify-center my-2">
              {getIcon(day.icon)}
            </div>
            <p className="text-sm font-bold text-black">{day.temp}°</p>
          </div>
        ))}
      </div>
    </div>
  )
}
