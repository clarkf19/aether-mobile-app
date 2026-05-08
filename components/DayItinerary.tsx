interface Activity {
  time: string
  title: string
  status?: 'pending' | 'approved' | 'rejected' | 'cost'
  cost?: number
}

interface DayData {
  day: string
  activities: Activity[]
}

interface DayItineraryProps {
  dayData: DayData
}

export default function DayItinerary({ dayData }: DayItineraryProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'border-black bg-yellow-300 text-black'
      case 'approved':
        return 'border-black bg-green-300 text-black'
      case 'rejected':
        return 'border-black bg-red-300 text-black'
      default:
        return 'border-black bg-white text-black'
    }
  }

  const getStatusBadge = (status?: string) => {
    const colors = {
      pending: '⏳',
      approved: '✓',
      rejected: '✕'
    }
    return colors[status as keyof typeof colors] || '◇'
  }

  return (
    <div className="flex-shrink-0 w-full">
      {/* Request Header */}
      <div className="card-neo mb-3 p-4 bg-cyan-300">
        <h3 className="text-sm font-bold text-black uppercase tracking-wide">{dayData.day}</h3>
      </div>

      {/* Timeline Flow */}
      <div className="space-y-2">
        {dayData.activities.map((activity, idx) => (
          <div
            key={idx}
            className={`card-neo p-3 transition-all ${getStatusColor(activity.status)}`}
          >
            <div className="flex items-start gap-2">
              <div className="text-lg mt-0.5 flex-shrink-0">
                {getStatusBadge(activity.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-black/60 font-bold uppercase">{activity.time}</p>
                <p className="text-sm font-semibold mt-1 text-black">{activity.title}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Create New Request Button */}
        <button className="btn-neo white w-full text-sm mt-2">
          + Create Request
        </button>
      </div>
    </div>
  )
}
