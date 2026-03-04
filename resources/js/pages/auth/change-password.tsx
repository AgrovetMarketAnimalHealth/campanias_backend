import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

export default function ChangePassword() {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = () => {
    post('/promo-concierto/backoffice/change-password');
};

    return (
        <AuthLayout
            title="Restablecer contraseña"
            description="Por favor, introduzca su nueva contraseña a continuación"
        >
            <Head title="Cambiar contraseña" />
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        className="mt-1 block w-full"
                        autoFocus
                        placeholder="Nueva contraseña"
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">
                        Confirmar contraseña
                    </Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        autoComplete="new-password"
                        className="mt-1 block w-full"
                        placeholder="Confirmar contraseña"
                        value={data.password_confirmation}
                        onChange={e => setData('password_confirmation', e.target.value)}
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>
                <Button
                    onClick={submit}
                    className="mt-4 w-full"
                    disabled={processing}
                >
                    {processing && <Spinner />}
                    Guardar contraseña
                </Button>
            </div>
        </AuthLayout>
    );
}