'use client'

interface CertificateForm {
  type: string
  purpose: string
  date: string
}

interface BookingForm {
  date: string
  timeSlot?: string
  duration?: string
  startTime?: string
  endTime?: string
  purpose: string
  attendees?: string
}

interface Room {
  id: string
  name: string
  location?: string
  type?: string
  capacity: number
}

export async function generatePDF(
  type: 'certificate' | 'room',
  certificateForm?: CertificateForm,
  bookingForm?: BookingForm,
  selectedRoomData?: Room | null
) {
  // Only import jspdf when this function is called (client-side only)
  if (typeof window === 'undefined') {
    console.error('PDF generation is only available on the client side')
    return
  }

  try {
    const jsPDFModule = await import('jspdf')
    const jsPDF = jsPDFModule.default
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Header
    doc.setFontSize(24)
    doc.text("BHAVAN'S CAMPUS", pageWidth / 2, 20, { align: 'center' })
    
    doc.setFontSize(10)
    doc.text('Andheri West, Mumbai', pageWidth / 2, 28, { align: 'center' })
    doc.line(20, 35, pageWidth - 20, 35)

    // Title
    doc.setFontSize(16)
    const title = type === 'certificate' ? 'CERTIFICATE REQUEST' : 'ROOM BOOKING REQUEST'
    doc.text(title, pageWidth / 2, 50, { align: 'center' })

    // Details
    doc.setFontSize(11)
    let yPos = 75
    
    if (type === 'certificate' && certificateForm) {
      doc.text(`Certificate Type: ${certificateForm.type}`, 30, yPos)
      yPos += 15
      doc.text(`Purpose: ${certificateForm.purpose}`, 30, yPos)
      yPos += 15
      doc.text(`Date Required: ${certificateForm.date}`, 30, yPos)
    } else if (bookingForm && selectedRoomData) {
      doc.text(`Room Name: ${selectedRoomData.name}`, 30, yPos)
      yPos += 15
      doc.text(`Capacity: ${selectedRoomData.capacity} persons`, 30, yPos)
      yPos += 15
      if (selectedRoomData.location) {
        doc.text(`Location: ${selectedRoomData.location}`, 30, yPos)
        yPos += 15
      } else if (selectedRoomData.type) {
        doc.text(`Type: ${selectedRoomData.type}`, 30, yPos)
        yPos += 15
      }
      doc.text(`Booking Date: ${bookingForm.date}`, 30, yPos)
      yPos += 15
      const timeLabel = bookingForm.timeSlot || (
        bookingForm.startTime && bookingForm.endTime
          ? `${bookingForm.startTime} - ${bookingForm.endTime}`
          : ''
      )
      if (timeLabel) {
        doc.text(`Time: ${timeLabel}`, 30, yPos)
        yPos += 15
      }
      if (bookingForm.duration) {
        doc.text(`Duration: ${bookingForm.duration} hour(s)`, 30, yPos)
        yPos += 15
      }
      doc.text(`Purpose: ${bookingForm.purpose}`, 30, yPos)
      if (bookingForm.attendees) {
        yPos += 15
        doc.text(`Expected Attendees: ${bookingForm.attendees}`, 30, yPos)
      }
    }
    
    yPos += 15
    doc.text(`Request Date: ${new Date().toLocaleDateString()}`, 30, yPos)
    yPos += 15
    doc.text(`Student ID: BCA-2024-001`, 30, yPos)
    yPos += 15
    doc.text(`Student Name: Anjali Shah`, 30, yPos)

    // Footer
    doc.setFontSize(10)
    doc.text('This is an automatically generated document from AETHER Campus OS', pageWidth / 2, pageHeight - 20, { align: 'center' })

    const filename = type === 'certificate' ? `certificate-request-${Date.now()}.pdf` : `room-booking-${Date.now()}.pdf`
    doc.save(filename)
    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}
