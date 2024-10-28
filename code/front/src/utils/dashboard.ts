interface Ping {
  timestamp: Date;
  status: 'up' | 'down';
  responseTime: number;
}

interface Service {
  name: string;
  pings: Ping[];
}

const FETCH_INTERVAL = 60000;
let lastFetchTime = 0;

function getUptimeColor(uptime: number): string {
  if (uptime >= 99) return 'text-green-600';
  if (uptime >= 95) return 'text-yellow-600';
  return 'text-red-600';
}

function getResponseTimeColor(time: number): string {
  if (time <= 100) return 'text-green-600';
  if (time <= 300) return 'text-yellow-600';
  return 'text-red-600';
}

function getStatusIcon(status: 'up' | 'down'): string {
  return status === 'up'
    ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
    : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
}

function updateStatusSummary(status: 'up' | 'down'): void {
  const summaryEl = document.querySelector('[data-status-summary]');
  if (!summaryEl) return;

  const statusHTML = `
    <span class="mr-3">
      ${status === 'up'
        ? '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
        : '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
      }
    </span>
    <span class="text-lg">
      ${status === 'up' ? 'All Systems Operational' : 'System Issues Detected'}
    </span>
  `;

  summaryEl.className = `flex items-center px-6 py-4 rounded-xl font-semibold border ${
    status === 'up'
      ? 'bg-green-50 text-green-800 border-green-200'
      : 'bg-red-50 text-red-800 border-red-200'
  }`;
  summaryEl.innerHTML = statusHTML;
}

function updateServiceTimeline(service: Service): void {
  const timelineEl = document.createElement('div');
  timelineEl.className = 'bg-white rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border border-gray-100';

  const currentStatus = service.pings[service.pings.length - 1].status;
  const uptime = (service.pings.filter(ping => ping.status === 'up').length / service.pings.length * 100).toFixed(2);
  const avgResponseTime = service.pings
    .filter(ping => ping.status === 'up')
    .reduce((sum, ping) => sum + ping.responseTime, 0) / service.pings.filter(ping => ping.status === 'up').length;

  timelineEl.innerHTML = `
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center space-x-3">
        <div class="w-2 h-2 rounded-full ${currentStatus === 'up' ? 'bg-green-500' : 'bg-red-500'} animate-pulse"></div>
        <h2 class="text-xl font-semibold text-gray-800">${service.name}</h2>
      </div>
      <div class="flex items-center space-x-3">
        <span class="inline-flex items-center space-x-1 text-sm font-medium px-3 py-1 rounded-full ${
          currentStatus === 'up'
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }">
          ${getStatusIcon(currentStatus)}
          <span>${currentStatus.toUpperCase()}</span>
        </span>
      </div>
    </div>

    <div class="flex gap-1 items-center mb-6 h-12 bg-gray-50 rounded-lg px-2 overflow-hidden">
      ${service.pings.map(ping => `
        <div
          class="flex-1 h-8 rounded transform transition-all duration-200 hover:scale-y-110 cursor-pointer ${
            ping.status === 'up'
              ? 'bg-green-500 bg-opacity-50 hover:bg-opacity-100'
              : 'bg-red-500 bg-opacity-50 hover:bg-opacity-100'
          }"
          title="${new Date(ping.timestamp).toLocaleDateString()} ${new Date(ping.timestamp).toLocaleTimeString()}
Status: ${ping.status.toUpperCase()}
Response Time: ${ping.responseTime}ms"
        ></div>
      `).join('')}
    </div>

    <div class="flex justify-between items-center text-sm px-1">
      <div class="flex flex-col">
        <span class="text-gray-500 mb-1">Uptime</span>
        <span class="font-bold text-lg ${getUptimeColor(parseFloat(uptime))}">${uptime}%</span>
      </div>
      <div class="h-12 w-px bg-gray-200"></div>
      <div class="flex flex-col items-end">
        <span class="text-gray-500 mb-1">Response Time</span>
        <span class="font-bold text-lg ${getResponseTimeColor(avgResponseTime)}">${avgResponseTime.toFixed(0)}ms</span>
      </div>
    </div>
  `;

  const timelinesContainer = document.getElementById('service-timelines');
  if (timelinesContainer) {
    timelinesContainer.appendChild(timelineEl);
  }
}

function updateCommunications(services: Service[], overallStatus: 'up' | 'down'): void {
  const communications = [
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      message: 'All systems are operating normally.',
      type: 'resolved' as const
    }
  ];

  if (overallStatus === 'down') {
    const downServices = services
      .filter(service => service.pings[service.pings.length - 1].status === 'down')
      .map(service => service.name)
      .join(', ');

    communications.unshift({
      timestamp: new Date(),
      message: `We are investigating reports of issues with: ${downServices}`,
      type: 'investigating' as const
    });
  }

  const communicationsEl = document.querySelector('[data-communications]');
  if (!communicationsEl) return;

  communicationsEl.innerHTML = `
    <ul class="space-y-6">
      ${communications.map(message => `
        <li class="flex items-start group">
          <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
            message.type === 'investigating'
              ? 'bg-yellow-100 text-yellow-600'
              : 'bg-green-100 text-green-600'
          }">
            ${message.type === 'investigating'
              ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
              : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
            }
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium mb-1 ${
              message.type === 'investigating' ? 'text-yellow-600' : 'text-green-600'
            }">
              ${message.type === 'investigating' ? 'Investigating Issue' : 'Issue Resolved'}
            </p>
            <p class="text-gray-800 mb-2">${message.message}</p>
            <p class="text-sm text-gray-500">${message.timestamp.toLocaleString()}</p>
          </div>
        </li>
      `).join('')}
    </ul>
  `;
}

async function fetchAndUpdateData(): Promise<void> {
  try {
    const now = Date.now();
    if (now - lastFetchTime < FETCH_INTERVAL) return;
    lastFetchTime = now;

    const response = await fetch('https://raw.githubusercontent.com/SegoCode/LiteStatus/main/code/ping/pingResults.json');
    const services = await response.json();

    const transformedServices = services.map((service: any) => ({
      ...service,
      pings: service.pings.map((ping: any) => ({
        ...ping,
        timestamp: new Date(ping.timestamp)
      }))
    }));

    const overallStatus = transformedServices.every(
      (service: Service) => service.pings[service.pings.length - 1].status === 'up'
    ) ? 'up' : 'down';

    const timelinesContainer = document.getElementById('service-timelines');
    if (timelinesContainer) {
      timelinesContainer.innerHTML = '';
    }

    updateStatusSummary(overallStatus);
    transformedServices.forEach((service: Service) => updateServiceTimeline(service));
    updateCommunications(transformedServices, overallStatus);
    
    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl) {
      lastUpdatedEl.textContent = `Last updated: ${new Date().toLocaleString()}`;
    }
  } catch (error) {
    console.error('Error fetching or processing data:', error);
    const timelinesContainer = document.getElementById('service-timelines');
    if (timelinesContainer) {
      timelinesContainer.innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
          <p class="font-medium">Unable to fetch LiteStatus</p>
          <p class="text-sm mt-1">Please try again later</p>
        </div>
      `;
    }
  }
}

export function setupDashboard(): void {
  fetchAndUpdateData();
  setInterval(fetchAndUpdateData, FETCH_INTERVAL);
}