import { gradientFromStr, initials } from '../utils/helpers';

export function Avatar({ name = '', size = 'md', style = {} }) {
    const cls = size === 'sm' ? 'avatar avatar-sm' : size === 'lg' ? 'avatar avatar-lg' : size === 'xl' ? 'avatar avatar-xl' : 'avatar';
    return (
        <div
            className={cls}
            style={{ background: gradientFromStr(name), ...style }}
            aria-label={name}
        >
            {initials(name)}
        </div>
    );
}
