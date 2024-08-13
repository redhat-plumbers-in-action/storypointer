# https://src.fedoraproject.org/rpms/nodejs-packaging
%global npm_name storypointer

Name:     nodejs-%{npm_name}
Version:  1.2.1
Release:  %autorelease
Summary:  Simple CLI tool to set JIRA Story Points and Priority 

License:  GPL-3.0-or-later
URL:      https://github.com/redhat-plumbers-in-action/storypointer
Source:   https://registry.npmjs.org/%{npm_name}/-/%{npm_name}-%{version}.tgz

BuildRequires: nodejs-devel

%global _description %{expand:
Simple CLI tool that provides an interactive interface to quickly set priority and story points for your JIRA issues.}

%description %{_description}

%package -n %{npm_name}
Summary:  %{summary}
License:  0BSD AND BSD-2-Clause AND GPL-3.0-or-later AND ISC AND MIT AND (MIT OR CC0-1.0)

%description -n %{npm_name} %{_description}

%files
%doc README.md
%license LICENSE LICENSE-BUNDLED
%{nodejs_sitelib}/%{npm_name}
%{_bindir}/%{npm_name}

%prep
%setup -q -n package

%build

%install
mkdir -p %{buildroot}%{nodejs_sitelib}/%{npm_name}/bin
install -p -D -m0755 dist/main.js %{buildroot}%{nodejs_sitelib}/%{npm_name}/bin/%{npm_name}
mkdir -p %{buildroot}%{_bindir}
ln -sf %{nodejs_sitelib}/%{npm_name}/bin/%{npm_name} %{buildroot}%{_bindir}/%{npm_name}

%if %{with check}
%check
yarn test
%endif

%changelog
%autochangelog
