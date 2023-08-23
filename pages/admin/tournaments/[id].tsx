import { SubmitHandler, useForm } from 'react-hook-form'
import { Tournament } from '@prisma/client'
import prisma from 'lib/prisma'
import SuperJSON from 'superjson'

export default function EditTournamentPage({ name, shortKey, active, id }: Tournament) {
  console.log(name, shortKey, active)
  const { register, handleSubmit, formState: { errors } } = useForm<Tournament>({
    defaultValues: {
      name,
      shortKey,
      active,
    }
  })
  const onSubmit: SubmitHandler<Tournament> = async (payload) => {
    const update = await fetch(`/api/admin/tournaments/${id}`, {
      method: 'PUT',
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
    console.log('success', data)
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
          <label>Key</label>
          <input type="text" disabled pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$" {...register('shortKey', { required: true })} />
          <label>Active</label>
          <input type="checkbox" {...register('active')} />
          <hr />
          <button type="submit">Save Tournament</button>
        </form>        
      </div>
    </div>
  )
}

export const getServerSideProps = async ({
  params
}: {
  params: {
    id: string
  }
}) => {
  const id = params.id
  const entry = await prisma.tournament.findUnique({
    where: {
      id: Number(id)
    }
  })
  if (!entry) {
    return { notFound: true }
  }
  const { json: tournament } = SuperJSON.serialize(entry)
  return {
    props: tournament
  }
}