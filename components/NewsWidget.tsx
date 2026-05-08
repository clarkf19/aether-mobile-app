export default function NewsWidget() {
  const events = [
    { emoji: '🎭', title: 'Theater Festival', date: 'Jun 15' },
    { emoji: '🍽️', title: 'Food Market', date: 'Jun 16' },
    { emoji: '🎪', title: 'Street Fair', date: 'Jun 17' },
  ]

  return (
    <div className="bg-white border-2 border-black p-4 font-bold" style={{ transform: 'rotate(-0.5deg)' }}>
      <h3 className="text-lg mb-4 flex items-center gap-2">
        <span>📰</span> Local Events
      </h3>
      <div className="space-y-3">
        {events.map((event, idx) => (
          <div key={idx} className="border-dashed border-2 border-black p-2 bg-white hover:bg-yellow-50 transition-colors">
            <div className="flex items-start gap-2">
              <span className="text-xl">{event.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-black">{event.title}</p>
                <p className="text-xs text-gray-600">{event.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
