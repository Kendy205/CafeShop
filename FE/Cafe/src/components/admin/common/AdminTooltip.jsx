import React from 'react'
import { Tooltip } from 'antd'

export default function AdminTooltip({ title, children, placement = 'top', color = '#1e293b', ...props }) {
    if (!title) return children
    
    return (
        <Tooltip 
            title={<span className="text-xs font-medium tracking-wide">{title}</span>} 
            placement={placement}
            color={color}
            overlayInnerStyle={{ 
                padding: '6px 12px', 
                borderRadius: '10px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            }}
            {...props}
        >
            {children}
        </Tooltip>
    )
}
