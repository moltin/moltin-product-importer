const config = {
  queues: [
    {
      // Name of the bull queue, this name must match up exactly with what you've defined in bull.
      name: 'get-file-events',

      // Hostname or queue prefix, you can put whatever you want.
      hostId: 'MyAwesomeQueues',

      redis: {
        port: '6379',
        host: '127.0.0.1',
        password: '',
      },
    },
    {
      // Name of the bull queue, this name must match up exactly with what you've defined in bull.
      name: 'insert-file-events',

      // Hostname or queue prefix, you can put whatever you want.
      hostId: 'MyAwesomeQueues',

      redis: {
        port: '6379',
        host: '127.0.0.1',
        password: '',
      },
    },
    {
      // Name of the bull queue, this name must match up exactly with what you've defined in bull.
      name: 'update-file-events',

      // Hostname or queue prefix, you can put whatever you want.
      hostId: 'MyAwesomeQueues',

      redis: {
        port: '6379',
        host: '127.0.0.1',
        password: '',
      },
    },
    {
      // Name of the bull queue, this name must match up exactly with what you've defined in bull.
      name: 'associate-file-events',

      // Hostname or queue prefix, you can put whatever you want.
      hostId: 'MyAwesomeQueues',

      redis: {
        port: '6379',
        host: '127.0.0.1',
        password: '',
      },
    },
  ],
}

export default config
