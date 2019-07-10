import producer from './apps/producer'
import consumer from './apps/consumer'

export default function runProductsApps() {
  producer()
  consumer()
}
