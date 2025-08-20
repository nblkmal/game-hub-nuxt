<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { StepperItem, RadioGroupItem } from '@nuxt/ui'
import { ref, reactive, shallowRef, watch, onMounted } from 'vue'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'

interface Booking {
  resource: string
  resourceUnit: string[]
  date: string
  startTime: string
  endTime: string
}

type Schema = v.InferOutput<typeof schema>

const BUSINESS_HOURS = {
  start: 8,
  end: 17,
  stepMinutes: 15
} as const

const DATE_FORMATTER = new DateFormatter('en-US', {
  dateStyle: 'medium'
})

const modelValue = shallowRef(new CalendarDate(2022, 1, 10))

const gameResources = ref<RadioGroupItem[]>([
  { label: 'Snooker', description: 'Classic snooker tables', value: 'snooker' },
  { label: 'PlayStation 5', description: 'Next-gen gaming console', value: 'playstation-5' },
  { label: 'Xbox Series X', description: 'Microsoft gaming console', value: 'xbox-series-x' },
  { label: 'Nintendo Switch', description: 'Nintendo gaming console', value: 'nintendo-switch' }
])

const snookerUnits = ref<RadioGroupItem[]>([
  { label: 'Table 1', value: 'table-1' },
  { label: 'Table 2', value: 'table-2' },
  { label: 'Table 3', value: 'table-3' },
  { label: 'Table 4', value: 'table-4' }
])

const playstationUnits = ref<RadioGroupItem[]>([
  { label: 'PlayStation 1', value: 'playstation-1' },
  { label: 'PlayStation 2', value: 'playstation-2' },
  { label: 'PlayStation 3', value: 'playstation-3' },
  { label: 'PlayStation 4', value: 'playstation-4' },
  { label: 'PlayStation 5', value: 'playstation-5', disabled: true },
  { label: 'PlayStation 6', value: 'playstation-6', disabled: true },
  { label: 'PlayStation 7', value: 'playstation-7', disabled: true },
  { label: 'PlayStation 8', value: 'playstation-8', disabled: true },
  { label: 'PlayStation 9', value: 'playstation-9', disabled: true },
  { label: 'PlayStation 10', value: 'playstation-10', disabled: true }
])

const stepperItems = ref<StepperItem[]>([
  {
    slug: 'choose-a-game',
    title: 'Choose a game',
    description: 'Select your preferred game and units',
    icon: 'i-lucide-gamepad'
  },
  {
    slug: 'confirm',
    title: 'Confirm',
    description: 'Review and confirm your booking',
    icon: 'i-lucide-check'
  }
])

function generateTimeOptions(startHour = BUSINESS_HOURS.start, endHour = BUSINESS_HOURS.end, stepMinutes = BUSINESS_HOURS.stepMinutes): string[] {
  const options: string[] = []
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += stepMinutes) {
      if (hour === endHour && minute > 0) break
      
      const formattedHour = String(hour).padStart(2, '0')
      const formattedMinute = String(minute).padStart(2, '0')
      options.push(`${formattedHour}:${formattedMinute}`)
    }
  }
  
  return options
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return -1
  }
  
  return hours * 60 + minutes
}

function getAvailableEndTimes(startTime: string): string[] {
  if (!startTime) return timeOptions.value
  
  const startMinutes = timeToMinutes(startTime)
  return timeOptions.value.filter(time => timeToMinutes(time) > startMinutes)
}

function createEmptyBooking(): Booking {
  return {
    resource: '',
    resourceUnit: [],
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: ''
  }
}

const bookingItemSchema = v.pipe(
  v.object({
    resource: v.pipe(v.string(), v.minLength(1, 'Please select a game')),
    resourceUnit: v.pipe(v.array(v.string()), v.minLength(1, 'Please select at least one unit')),
    date: v.pipe(v.string(), v.minLength(1, 'Please select a date')),
    startTime: v.pipe(v.string(), v.minLength(1, 'Please select a start time')),
    endTime: v.pipe(v.string(), v.minLength(1, 'Please select an end time'))
  }),
  v.check(
    (booking) => {
      if (!booking.startTime || !booking.endTime) return true
      return timeToMinutes(booking.endTime) > timeToMinutes(booking.startTime)
    },
    'End time must be after start time'
  )
)

const schema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  phone: v.pipe(v.string(), v.minLength(1, 'Phone is required')),
  email: v.pipe(v.string(), v.email('Please enter a valid email')),
  bookings: v.pipe(
    v.array(bookingItemSchema),
    v.minLength(1, 'Please add at least one booking')
  )
})

const timeOptions = ref(generateTimeOptions())

const state = reactive({
  name: 'akmal',
  phone: '0123456789',
  email: 'akmal@gmail.com',
  bookings: [createEmptyBooking()]
})

function getUnitsForResource(resource: string): RadioGroupItem[] {
  return resource === 'playstation-5' ? playstationUnits.value : snookerUnits.value
}

function getGridColumns(resource: string): string {
  return resource === 'playstation-5' ? 'sm:grid-cols-5' : 'sm:grid-cols-4'
}

watch(
  () => state.bookings.map(booking => booking.resource),
  (newResources, oldResources) => {
    newResources.forEach((resource, index) => {
      if (!resource || resource === oldResources?.[index]) return
      
      const booking = state.bookings[index]
      if (booking) {
        booking.resourceUnit = []
      }
    })
  }
)

watch(
  () => state.bookings.map(booking => booking.startTime),
  (newStartTimes) => {
    newStartTimes.forEach((startTime, index) => {
      const booking = state.bookings[index]
      if (!startTime || !booking) return
      
      const validEndTimes = getAvailableEndTimes(startTime)
      if (!booking.endTime || timeToMinutes(booking.endTime) <= timeToMinutes(startTime)) {
        booking.endTime = validEndTimes[0] || ''
      }
    })
  }
)

const toast = useToast()

async function handleFormSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const response = await $fetch('https://nginx.slotify.orb.local/api/bookings', {
      method: 'POST',
      body: event.data
    })

    console.log('Booking created successfully:', response)
    toast.add({ 
      title: 'Success', 
      description: 'Your booking has been created successfully', 
      color: 'green' 
    })
  } catch (error: any) {
    console.error('Booking creation failed:', error)
    toast.add({ 
      title: 'Error', 
      description: error.message || 'Failed to create booking', 
      color: 'red' 
    })
  }
}

function addBooking() {
  state.bookings.push(createEmptyBooking())
}

function removeBooking(index: number) {
  if (state.bookings.length <= 1) return
  state.bookings.splice(index, 1)
}

const stepper = useTemplateRef('stepper')

onMounted(() => {
  console.log('Booking component mounted')
})

</script>

<template>
  <div class="p-5 md:p-40">
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="handleFormSubmit">
      <UStepper color="neutral" ref="stepper" :items="stepperItems" class="w-full">
        <template #content="{ item }">
          <UCard v-if="item.slug === 'choose-a-game'">
            <div class="flex flex-col gap-6">
              <div v-for="(booking, index) in state.bookings" :key="index" class="bg-muted rounded-lg p-4 space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-medium">Booking {{ index + 1 }}</h3>
                  <div class="flex gap-2">
                    <!-- <UButton size="xs" color="neutral" variant="soft" leading-icon="i-lucide-plus" @click="addBooking">Add</UButton> -->
                    <UButton size="xs" color="neutral" variant="soft" leading-icon="i-lucide-trash" v-if="state.bookings.length > 1" @click="removeBooking(index)">Remove</UButton>
                  </div>
                </div>

                <UFormField :label="`Game`" :name="`bookings.${index}.resource`">
                  <URadioGroup
                    v-model="booking.resource"
                    :ui="{ fieldset: 'sm:flex-col md:flex-row w-full gap-2', item: 'w-full bg-neutral-600' }"
                    indicator="hidden"
                    variant="card"
                    :items="gameResources"
                    class="w-full "
                  />
                </UFormField>

                <UFormField :label="`Unit`" :name="`bookings.${index}.resourceUnit`">
                  <UCheckboxGroup
                    v-model="booking.resourceUnit"
                    color="primary"
                    indicator="hidden"
                    :ui="{ fieldset: `flex flex-col sm:grid ${getGridColumns(booking.resource)} gap-2`, item: 'w-full bg-neutral-600' }"
                    variant="card"
                    :items="getUnitsForResource(booking.resource)"
                    class="w-full"
                  >
                    <template #label="{ item }">
                      <div class="flex justify-center">
                        <div class="flex items-center gap-2">
                          <UIcon :name="booking.resource === 'playstation-5' ? 'i-lucide-joystick' : 'i-lucide-toy-brick'" />
                          <span>{{ item.label }}</span>
                        </div>
                      </div>
                    </template>
                  </UCheckboxGroup>
                </UFormField>

                <div class="flex flex-col md:flex-row gap-4">
                  <UFormField :label="`Date`" :name="`bookings.${index}.date`" class="w-full">
                    <UPopover>
                      <UButton color="neutral" variant="subtle" icon="i-lucide-calendar" class="w-full">
                        {{ modelValue ? DATE_FORMATTER.format(modelValue.toDate(getLocalTimeZone())) : 'Select a date' }}
                      </UButton>

                      <template #content>
                        <UCalendar v-model="booking.date" class="p-2" />
                      </template>
                    </UPopover>
                  </UFormField>

                  <UFormField :label="`Start time`" :name="`bookings.${index}.startTime`" class="w-full">
                    <USelect v-model="booking.startTime" :items="timeOptions" placeholder="Select start time" class="w-full"/>
                  </UFormField>

                  <UFormField :label="`End time`" :name="`bookings.${index}.endTime`" class="w-full">
                    <USelect v-model="booking.endTime" :items="getAvailableEndTimes(booking.startTime)" placeholder="Select end time" class="w-full"/>
                  </UFormField>
                </div>
              </div>

              <div>
                <UButton color="neutral" variant="soft" leading-icon="i-lucide-plus" @click="addBooking">Want to play other games?</UButton>
              </div>
            </div>
          </UCard>

          <UCard v-if="item.slug === 'confirm'" class="flex flex-col gap-4 justify-center">
            <h3 class="font-medium">Summary</h3>
            <div class="flex flex-col md:flex-row gap-4 w-full">
              <div v-if="state.bookings.length === 1 && state.bookings[0].resource !== ''" class="w-full flex flex-col gap-4">
                <div v-for="(booking, index) in state.bookings" :key="index" class="bg-muted rounded-lg p-4">
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-gamepad" />
                      <span>{{ booking.resource }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-calendar" />
                      <span>{{ booking.date }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-clock" />
                      <span>{{ booking.startTime }} - {{ booking.endTime }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="flex flex-wrap gap-2">
                        <UBadge v-for="unit in booking.resourceUnit" :key="unit" color="neutral" variant="subtle">{{ unit }}</UBadge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="w-full flex gap-4 bg-muted p-8 rounded-lg items-center justify-center">
                <UIcon name="i-lucide-circle-help" />
                <p class="text-center">No bookings found</p>
              </div>
              <div class="bg-muted p-2 md:p-8 flex flex-col gap-4 w-full rounded-lg">
                <UFormField label="Name" name="name" class="w-full">
                  <UInput v-model="state.name" class="w-full" />
                </UFormField>
                <UFormField label="Phone" name="phone" class="w-full">
                  <UInput v-model="state.phone" class="w-full" />
                </UFormField>
                <UFormField label="Email" name="email" class="w-full">
                  <UInput v-model="state.email" class="w-full" type="email" />
                </UFormField>
              </div>
            </div>

          </UCard>
        </template>
      </UStepper>

      <div class="flex gap-2 justify-between mt-4">
        <UButton
          leading-icon="i-lucide-arrow-left"
          :disabled="!stepper?.hasPrev"
          @click="stepper?.prev()"
          variant="neutral"
        >
          Prev
        </UButton>

        <UButton
          trailing-icon="i-lucide-arrow-right"
          :disabled="!stepper?.hasNext"
          @click="stepper?.next()"
          variant="neutral"
        >
          Next
        </UButton>
      </div>

      <!-- Submit button outside stepper -->
      <div class="flex justify-end mt-4">
        <UButton 
          type="submit" 
          color="primary" 
          icon="i-lucide-rocket" 
          :disabled="state.bookings.length === 1 && state.bookings[0].resource === ''"
        >
          Confirm Booking
        </UButton>
      </div>
    </UForm>
  </div>
</template>

