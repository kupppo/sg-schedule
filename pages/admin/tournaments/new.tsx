import { SubmitHandler, useForm } from 'react-hook-form'
import { Tournament } from '@prisma/client'

export default function NewTournamentPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<Tournament>()
  const onSubmit: SubmitHandler<Tournament> = async (payload) => {
    const update = await fetch(`/api/admin/tournaments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    if (!update.ok) {
      console.error('error update')
      return
    }
    const data = await update.json()
    console.log('success and redirect', data)
  }
  
  if (Object.keys(errors).length > 0) {
    console.info(errors)
  }

  return (
    <div>
      new tournament page
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Name</label>
          <input type="text" {...register('name', { required: true })} />
          <label>Short Key</label>
          <input type="text" pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$" {...register('shortKey', { required: true })} />
          <label>Active</label>
          <input type="checkbox" {...register('active')} />
          <hr />
          <button type="submit">Create Tournament</button>
        </form>        
      </div>
    </div>
  )
}
