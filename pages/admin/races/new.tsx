import { getServerSession } from 'next-auth/next'
import { authOptions } from 'lib/nextauth'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Race } from '@prisma/client'
import { GetServerSidePropsContext } from 'next'

export default function NewRacePage() {
  const { register, handleSubmit, formState: { errors } } = useForm<Race>()
  const onSubmit: SubmitHandler<Race> = async (payload) => {
    console.log(payload)
    // const update = await fetch(`/api/admin/races`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(payload)
    // })
    // if (!update.ok) {
    //   console.error('error update')
    //   return
    // }
    // const data = await update.json()
    // console.log('success and redirect', data)
  }
  
  if (Object.keys(errors).length > 0) {
    console.info(errors)
  }

  return (
    <div>
      new race page
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Name</label>
          <input disabled type="text" {...register('name', { required: true })} />
          <br />
          <label>Scheduled Time</label>
          <input type="datetime-local" />
          <input type="hidden" name="timezone" value="-05:00" />
          <hr />
          <button type="submit">Create Tournament</button>
        </form>        
      </div>
    </div>
  )
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  const allowedRoles = ['admin', 'editor']
  if (!session) {
    return {
      redirect: {
        destination: '/login?callbackUrl=/admin',
        permanent: false,
      }
    }
  }

  // @ts-ignore
  const role = session?.user?.role
  if (!role) {
    // show denied
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }
  const notAllowed = !allowedRoles.includes(role)
  if (notAllowed) {
    // show denied
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  return {
    props: {}
  }
}
