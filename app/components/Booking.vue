<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { StepperItem } from '@nuxt/ui'
import type { RadioGroupItem } from '@nuxt/ui'
import { ref, reactive, shallowRef, watch } from 'vue'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'

const df = new DateFormatter('en-US', {
  dateStyle: 'medium'
})

const modelValue = shallowRef(new CalendarDate(2022, 1, 10))

const resources = ref<RadioGroupItem[]>([
  {
    label: 'Snooker',
    description: 'This is the first option.',
    value: 'snooker'
  },
  {
    label: 'PlayStation 5',
    description: 'This is the first option.',
    value: 'playstation-5'
  },
  {
    label: 'Xbox Series X',
    description: 'This is the first option.',
    value: 'xbox-series-x'
  },
  {
    label: 'Nintendo Switch',
    description: 'This is the first option.',
    value: 'nintendo-switch'
  }
])
const resourcesUnit = ref<RadioGroupItem[]>([
  {
    label: 'Table 1',
    value: 'table-1',
  },
  {
    label: 'Table 2',
    value: 'table-2'
  },
  {
    label: 'Table 3',
    value: 'table-3'
  },
  {
    label: 'Table 4',
    value: 'table-4'
  }
])
const resourcesUnitPlaystation = ref<RadioGroupItem[]>([
  {
    label: 'Playstation 1',
    value: 'playstation-1'
  },
  {
      label: 'Playstation 2',
      value: 'playstation-2'
    },
    {
      label: 'Playstation 3',
      value: 'playstation-3'
    },
    {
      label: 'Playstation 4',
      value: 'playstation-4'
    },
    {
      label: 'Playstation 5',
      value: 'playstation-5',
      disabled: true
    },
    {
      label: 'Playstation 6',
      value: 'playstation-6',
      disabled: true
    },
    {
      label: 'Playstation 7',
      value: 'playstation-7',
      disabled: true
    },
    {
      label: 'Playstation 8',
      value: 'playstation-8',
      disabled: true
    },
    {
      label: 'Playstation 9',
      value: 'playstation-9',
      disabled: true
    },
    {
      label: 'Playstation 10',
      value: 'playstation-10',
      disabled: true
    }
])
const items = ref<StepperItem[]>([
  {
    slug: 'choose-a-game',
    title: 'Choose a game',
    description: 'Choose a game',
    icon: 'i-lucide-gamepad'
  },
  {
    slug: 'confirm',
    title: 'Confirm',
    description: 'Confirm',
    icon: 'i-lucide-check'
  }
])

function generateTimeOptions(startHour = 8, endHour = 17, stepMinutes = 15) {
  const options: string[] = []
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += stepMinutes) {
      if (hour === endHour && minute > 0) break
      const h = String(hour).padStart(2, '0')
      const m = String(minute).padStart(2, '0')
      options.push(`${h}:${m}`)
    }
  }
  return options
}

const timeOptions = ref(generateTimeOptions(8, 17, 15))

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return -1
  return h * 60 + m
}

function getEndOptions(start: string): string[] {
  if (!start) return timeOptions.value
  const startMin = toMinutes(start)
  return timeOptions.value.filter(t => toMinutes(t) > startMin)
}

const bookingItemSchema = v.pipe(
  v.object({
    resource: v.pipe(v.string(), v.minLength(1, 'Choose a game')),
    resourceUnit: v.pipe(v.string(), v.minLength(1, 'Choose a unit')),
    multipleResourceUnit: v.pipe(v.array(v.string()), v.minLength(1, 'Choose a unit')),
    date: v.pipe(v.string(), v.minLength(1, 'Choose a date')),
    startTime: v.pipe(v.string(), v.minLength(1, 'Choose a start time')),
    endTime: v.pipe(v.string(), v.minLength(1, 'Choose an end time'))
  }),
  v.check(
    (b) => !b.startTime || !b.endTime || toMinutes(b.endTime) > toMinutes(b.startTime),
    'End time must be after start time'
  )
)

const schema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email')),
  password: v.pipe(v.string(), v.minLength(8, 'Must be at least 8 characters')),
  bookings: v.pipe(
    v.array(bookingItemSchema),
    v.minLength(1, 'Add at least one booking')
  )
})

type Schema = v.InferOutput<typeof schema>

type Booking = {
  resource: string
  resourceUnit: string
  multipleResourceUnit: string[]
  date: string
  startTime: string
  endTime: string
}

const state = reactive({
  name: '',
  phone: '',
  email: '',
  bookings: [
    { resource: '', resourceUnit: '', multipleResourceUnit: [], date: new Date().toISOString().split('T')[0], startTime: '', endTime: '' } as Booking
  ],
  
})

// Reset unit selections when resource changes
watch(
  () => state.bookings.map(b => b.resource),
  (newResources, oldResources) => {
    newResources.forEach((resource, index) => {
      if (!resource) return
      if (resource !== oldResources?.[index]) {
        if (resource === 'playstation-5') {
          state.bookings[index].resourceUnit = ''
          state.bookings[index].multipleResourceUnit = []
        } else {
          state.bookings[index].multipleResourceUnit = []
          const firstUnit = (resourcesUnit.value?.[0] as string | undefined) || ''
          state.bookings[index].resourceUnit = firstUnit
        }
      }
    })
  }
)

// Ensure endTime stays after startTime
watch(
  () => state.bookings.map(b => b.startTime),
  (newStarts) => {
    newStarts.forEach((start, index) => {
      const booking = state.bookings[index]
      if (!start) return
      const validOptions = getEndOptions(start)
      if (!booking.endTime || toMinutes(booking.endTime) <= toMinutes(start)) {
        booking.endTime = validOptions[0] || ''
      }
    })
  }
)

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })
  console.log(event.data)
}

const stepper = useTemplateRef('stepper')

function addBooking() {
  state.bookings.push({ resource: '', resourceUnit: '', multipleResourceUnit: [], date: new Date().toISOString().split('T')[0], startTime: '', endTime: '' })
}

function removeBooking(index: number) {
  if (state.bookings.length <= 1) return
  state.bookings.splice(index, 1)
}

</script>

<template>
  <div class="p-5 md:p-40">
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UStepper color="neutral" ref="stepper" :items="items" class="w-full">
        <template #content="{ item }">
          <UCard v-if="item.slug === 'choose-a-game'">
            <div class="flex flex-col gap-6">
              <div v-for="(booking, index) in state.bookings" :key="index" class="bg-gray-50 rounded-lg p-4 space-y-4">
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
                    :ui="{ fieldset: 'sm:flex-col md:flex-row w-full', item: 'w-full bg-white' }"
                    indicator="hidden"
                    variant="card"
                    :items="resources"
                    class="w-full "
                  />
                </UFormField>

                <UFormField v-if="booking.resource !== 'playstation-5'" :label="`Unit`" :name="`bookings.${index}.resourceUnit`">
                  <URadioGroup
                    v-model="booking.resourceUnit"
                    :ui="{ fieldset: 'sm:flex-col md:flex-row w-full', item: 'w-full bg-white' }"
                    indicator="hidden"
                    variant="card"
                    :items="resourcesUnit"
                    class="w-full "
                  >
                    <template #label="{ item }">
                      <div class="flex justify-center">
                        <div class="flex items-center gap-2">
                          <UIcon name="i-lucide-toy-brick" />
                          <span>{{ item.label }}</span>
                        </div>
                      </div>
                    </template>
                  </URadioGroup>
                </UFormField>

                <UFormField v-else :label="`Sim Racing Slot`" :name="`bookings.${index}.multipleResourceUnit`">
                  <UCheckboxGroup
                    color="primary"
                    indicator="hidden"
                    :ui="{ fieldset: 'sm:flex-col md:flex-row w-full grid grid-cols-5 gap-2', item: 'w-full bg-white' }"
                    v-model="booking.multipleResourceUnit"
                    variant="card"
                    :items="resourcesUnitPlaystation"
                    class="w-full"
                  >
                    <template #label="{ item }">
                      <div class="flex justify-center">
                        <div class="flex items-center gap-2">
                          <UIcon name="i-lucide-joystick" />
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
                        {{ modelValue ? df.format(modelValue.toDate(getLocalTimeZone())) : 'Select a date' }}
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
                    <USelect v-model="booking.endTime" :items="getEndOptions(booking.startTime)" placeholder="Select end time" class="w-full"/>
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
                <div v-for="(booking, index) in state.bookings" :key="index" class="bg-gray-50 rounded-lg p-4">
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
                      <div v-if="booking.resource === 'playstation-5'" class="flex flex-wrap gap-2">
                        <UBadge v-for="unit in booking.multipleResourceUnit" :key="unit" color="neutral" variant="subtle">{{ unit }}</UBadge>
                      </div>
                      <UBadge v-else color="neutral" variant="subtle">{{ booking.resourceUnit }}</UBadge>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="w-full flex gap-4 bg-gray-50 p-8 rounded-lg items-center justify-center">
                <UIcon name="i-lucide-circle-help" />
                <p class="text-center">No bookings found</p>
              </div>
              <div class="bg-gray-50 p-2 md:p-8 flex flex-col gap-4 w-full rounded-lg">
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

            <div class="w-full flex justify-end mt-4">
              <UButton type="submit" color="neutral" icon="i-lucide-rocket" :disabled="state.bookings.length === 1 && state.bookings[0].resource === ''">
                Confirm Booking
              </UButton>
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
    </UForm>
  </div>
</template>

