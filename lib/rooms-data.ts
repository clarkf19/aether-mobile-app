import 'server-only'
import { promises as fs } from 'fs'
import path from 'path'

export interface RoomCatalogItem {
  id: string
  name: string
  type: string
  capacity: number
}

interface RoomsDataFile {
  rooms: RoomCatalogItem[]
  availableTimeSlots: string[]
}

const fallbackRoomsData: RoomsDataFile = {
  rooms: [],
  availableTimeSlots: [],
}

export async function readRoomsData(): Promise<RoomsDataFile> {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const roomsPath = path.join(dataDir, 'roomsData.json')
    const content = await fs.readFile(roomsPath, 'utf-8')
    const parsed = JSON.parse(content)

    return {
      rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
      availableTimeSlots: Array.isArray(parsed.availableTimeSlots) ? parsed.availableTimeSlots : [],
    }
  } catch (error) {
    console.error('Error reading rooms data:', error)
    return fallbackRoomsData
  }
}
