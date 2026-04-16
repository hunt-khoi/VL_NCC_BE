export class MenuConfig {
	public defaults: any = {
		header: {
			self: {},
			items: [
				{
					title: 'Trang chủ',
					root: true,
					alignment: 'left',
					page: '',
					translate: 'MENU.DASHBOARD',
				},
				{
					title: 'Applications',
					root: true,
					alignment: 'left',
					toggle: 'click',
					submenu: [
						{
							title: 'eCommerce',
							bullet: 'dot',
							icon: 'flaticon-business',
							permission: 'accessToECommerceModule',
							submenu: [
								{
									title: 'Customers',
									page: '/ecommerce/customers'
								},
								{
									title: 'Products',
									page: '/ecommerce/products'
								},
							]
						},
						{
							title: 'User Management',
							bullet: 'dot',
							icon: 'flaticon-user',
							submenu: [
								{
									title: 'Users',
									page: '/user-management/users'
								},
								{
									title: 'Roles',
									page: '/user-management/roles'
								}
							]
						},
					]
				},
				{
					title: 'Custom',
					root: true,
					alignment: 'left',
					toggle: 'click',
					submenu: [
						{
							title: 'Error Pages',
							bullet: 'dot',
							icon: 'flaticon2-list-2',
							submenu: [
								{
									title: 'Error 1',
									page: '/error/error-v1'
								},
							]
						},
						{
							title: 'Wizard',
							bullet: 'dot',
							icon: 'flaticon2-mail-1',
							submenu: [
								{
									title: 'Wizard 1',
									page: '/wizard/wizard-1'
								},
							]
						},
					]
				},
			]
		},
		aside: {
			self: {},
			items: [
				{
					title: 'Trang chủ',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: '',
					translate: 'MENU.DASHBOARD',
					bullet: 'dot',
				}
			]
		},
	};

	public get configs(): any {
		return this.defaults;
	}
}