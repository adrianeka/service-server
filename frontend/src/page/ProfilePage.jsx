import Navbar from "../components/Navbar";
import { Card } from "../components/ui/card";

function ProfilePage() {
    return (
        <>
            <Navbar />
            <div className="max-w-6xl mx-auto p-8">

                {/* Profile Title Card */}
                <Card className="mb-10 p-10 bg-white border border-gray-200 rounded-xl shadow-md">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Profile
                    </h1>
                {/* Profile Information Card */}
                <Card className="mb-8 p-12 bg-white border border-gray-200 rounded-xl shadow-md mt-5">
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            Profile Information
                        </h2>
                        <p className="text-base text-gray-600">
                            Update your account's profile information and email address.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                defaultValue="Username"
                                className="w-full bg-gray-100 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                defaultValue="email@email.com"
                                className="w-full bg-gray-100 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md">
                            Save
                        </button>
                    </div>
                </Card>

                {/* Update Password Card */}
                <Card className="p-12 bg-white border border-gray-200 rounded-xl shadow-md">
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            Update Password
                        </h2>
                        <p className="text-base text-gray-600">
                            Ensure your account is using a long, random password to stay secure.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <input
                                type="password"
                                className="w-full bg-gray-100 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                className="w-full bg-gray-100 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                className="w-full bg-gray-100 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            Save
                        </button>
                    </div>
                </Card>
                </Card>

            </div>
        </>
    );
}

export default ProfilePage;
