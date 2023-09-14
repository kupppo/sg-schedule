'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from 'lib/utils'
// import { Button } from "@/components/ui/button"
import { Command } from 'cmdk'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover'

export function Combobox({ options }: { options: string[] }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button>
        {/* <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        > */}
          {value
            ? options.find((p) => p.toLowerCase() === value)
            : "Select participant..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        {/* </Button> */}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <Command.Input placeholder="Search participant..." />
          <Command.Empty>No participant found.</Command.Empty>
          <Command.Group>
            {options.map((participant) => (
              <Command.Item
                key={participant}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === participant ? "opacity-100" : "opacity-0"
                  )}
                />
                {participant}
              </Command.Item>
            ))}
          </Command.Group>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
