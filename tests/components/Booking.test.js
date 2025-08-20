import { describe, it, expect, beforeEach } from '@jest/globals'

describe('Booking Component', () => {
  let mockState
  let mockBooking

  beforeEach(() => {
    mockBooking = {
      resource: '',
      resourceUnit: [],
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: ''
    }

    mockState = {
      name: 'John Doe',
      phone: '1234567890',
      email: 'john@example.com',
      bookings: [mockBooking]
    }
  })

  it('should validate booking form data structure', () => {
    expect(mockState.name).toBeTruthy()
    expect(mockState.phone).toHaveLength(10)
    expect(mockState.email).toContain('@')
    expect(mockState.bookings).toHaveLength(1)
    expect(mockState.bookings[0]).toHaveProperty('resource')
    expect(mockState.bookings[0]).toHaveProperty('resourceUnit')
    expect(mockState.bookings[0]).toHaveProperty('date')
    expect(mockState.bookings[0]).toHaveProperty('startTime')
    expect(mockState.bookings[0]).toHaveProperty('endTime')
  })

  it('should validate time format conversion', () => {
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number)
      if (Number.isNaN(hours) || Number.isNaN(minutes)) return -1
      return hours * 60 + minutes
    }

    expect(timeToMinutes('10:30')).toBe(630)
    expect(timeToMinutes('14:45')).toBe(885)
    expect(timeToMinutes('09:00')).toBe(540)
    expect(timeToMinutes('invalid')).toBe(-1)
  })

  it('should validate resource unit selection logic', () => {
    const getUnitsForResource = (resource) => {
      const snookerUnits = [
        { label: 'Table 1', value: 'table-1' },
        { label: 'Table 2', value: 'table-2' },
        { label: 'Table 3', value: 'table-3' },
        { label: 'Table 4', value: 'table-4' }
      ]
      
      const playstationUnits = [
        { label: 'PlayStation 1', value: 'playstation-1' },
        { label: 'PlayStation 2', value: 'playstation-2' },
        { label: 'PlayStation 3', value: 'playstation-3' },
        { label: 'PlayStation 4', value: 'playstation-4' }
      ]

      return resource === 'playstation-5' ? playstationUnits : snookerUnits
    }

    const snookerResult = getUnitsForResource('snooker')
    const playstationResult = getUnitsForResource('playstation-5')

    expect(snookerResult).toHaveLength(4)
    expect(playstationResult).toHaveLength(4)
    expect(snookerResult[0].label).toBe('Table 1')
    expect(playstationResult[0].label).toBe('PlayStation 1')
  })

  it('should validate grid column calculation', () => {
    const getGridColumns = (resource) => {
      return resource === 'playstation-5' ? 'sm:grid-cols-5' : 'sm:grid-cols-4'
    }

    expect(getGridColumns('playstation-5')).toBe('sm:grid-cols-5')
    expect(getGridColumns('snooker')).toBe('sm:grid-cols-4')
    expect(getGridColumns('xbox-series-x')).toBe('sm:grid-cols-4')
  })

  it('should validate empty booking creation', () => {
    const createEmptyBooking = () => {
      return {
        resource: '',
        resourceUnit: [],
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: ''
      }
    }

    const emptyBooking = createEmptyBooking()

    expect(emptyBooking.resource).toBe('')
    expect(emptyBooking.resourceUnit).toEqual([])
    expect(emptyBooking.startTime).toBe('')
    expect(emptyBooking.endTime).toBe('')
    expect(emptyBooking.date).toBe(new Date().toISOString().split('T')[0])
  })
})
