import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import NotFound from '../NotFound.vue'
import { createTestWrapper } from '@/test/setup'

// Mock router
const mockPush = vi.fn()
const mockGo = vi.fn()

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      go: mockGo
    })
  }
})

describe('NotFound Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render 404 error message', () => {
    const wrapper = mount(NotFound, createTestWrapper(NotFound))
    
    expect(wrapper.text()).toContain('404')
    expect(wrapper.text()).toContain('Page Not Found')
    expect(wrapper.text()).toContain("The page you're looking for doesn't exist or has been moved.")
  })

  it('should have navigation buttons', () => {
    const wrapper = mount(NotFound, createTestWrapper(NotFound))
    
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)
    
    const dashboardButton = buttons.find(button => 
      button.text().includes('Go to Dashboard')
    )
    const backButton = buttons.find(button => 
      button.text().includes('Go Back')
    )
    
    expect(dashboardButton).toBeTruthy()
    expect(backButton).toBeTruthy()
  })

  it('should navigate to dashboard when clicking dashboard button', async () => {
    const wrapper = mount(NotFound, createTestWrapper(NotFound))
    
    const dashboardButton = wrapper.find('button:contains("Go to Dashboard")')
    await dashboardButton?.trigger('click')
    
    expect(mockPush).toHaveBeenCalledWith({ name: 'Dashboard' })
  })

  it('should go back when clicking back button', async () => {
    const wrapper = mount(NotFound, createTestWrapper(NotFound))
    
    const backButton = wrapper.find('button:contains("Go Back")')
    await backButton?.trigger('click')
    
    expect(mockGo).toHaveBeenCalledWith(-1)
  })

  it('should have proper styling classes', () => {
    const wrapper = mount(NotFound, createTestWrapper(NotFound))
    
    expect(wrapper.find('.fill-height').exists()).toBe(true)
    expect(wrapper.find('.text-center').exists()).toBe(true)
  })
})